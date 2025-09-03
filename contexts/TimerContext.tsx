'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { audioNotifications } from '@/utils/audioNotifications'
import { notifications } from '@/utils/notifications'
import { calculateStudySegments, getCurrentSegmentInfo, StudySegment } from '@/utils/studySegments'

type StudyMethod = {
  id: string
  name: string
  cycles?: number
} | null

interface CompletionData {
  method: string
  duration: number
  breakDuration: number
  cycles: number
  totalDuration: number
  completionType: 'completed' | 'manual_stop'
}

interface TimerState {
  isActive: boolean
  isPaused: boolean
  isBreak: boolean
  studyDuration: number
  breakDuration?: number
  cycles?: number
  timeLeft: number
  startTime: number | null
  selectedMethod: StudyMethod
  currentSegmentType?: 'study' | 'break'
  lastTransitionMinute?: number
  cachedSegments?: StudySegment[] // Cache segments to avoid recalculating every second
  pendingTransition?: {
    fromType: 'study' | 'break'
    toType: 'study' | 'break'
    transitionTime: number
  }
  completionData?: CompletionData // Data for the global completion modal
}

interface TimerContextType {
  timerState: TimerState
  startTimer: (duration: number, method: StudyMethod, breakDuration?: number, cycles?: number) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  isTimerRunning: () => boolean
  confirmTransition: () => void
  cancelTransition: () => void
  clearCompletionData: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

const TIMER_STORAGE_KEY = 'study-timer-state'
const SETTINGS_STORAGE_KEY = 'study-timer-settings'

// Default timer state to prevent code duplication
const createDefaultTimerState = (): TimerState => ({
  isActive: false,
  isPaused: false,
  isBreak: false,
  studyDuration: 0,
  breakDuration: undefined,
  cycles: undefined,
  timeLeft: 0,
  startTime: null,
  selectedMethod: null,
  currentSegmentType: undefined,
  lastTransitionMinute: undefined,
  cachedSegments: undefined,
  pendingTransition: undefined,
  completionData: undefined
})

// Utility function to safely read settings from localStorage
const getSettingValue = (key: string, defaultValue: boolean = false): boolean => {
  if (typeof window === 'undefined') return defaultValue
  
  try {
    const settings = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (settings) {
      const parsed = JSON.parse(settings)
      return Boolean(parsed[key])
    }
  } catch (error) {
    console.error(`Error reading ${key} setting:`, error)
  }
  return defaultValue
}

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  // Note: We can't use useSettings here due to provider hierarchy, so we'll check localStorage directly
  const [timerState, setTimerState] = useState<TimerState>(createDefaultTimerState)

  // Load timer state from localStorage on mount
  useEffect(() => {
    // Only access localStorage on client-side
    if (typeof window === 'undefined') return
    
    try {
      const savedState = localStorage.getItem(TIMER_STORAGE_KEY)
      if (savedState) {
        const parsed = JSON.parse(savedState)
        
        // Validate parsed state structure
        if (typeof parsed.isActive !== 'boolean' || typeof parsed.timeLeft !== 'number') {
          localStorage.removeItem(TIMER_STORAGE_KEY)
          return
        }
        
        // If there was an active timer, calculate current time
        if (parsed.isActive && parsed.startTime && !parsed.isPaused) {
          const now = Date.now()
          const elapsed = Math.floor((now - parsed.startTime) / 1000)
          const newTimeLeft = Math.max(0, parsed.timeLeft - elapsed)
          
          if (newTimeLeft > 0) {
            setTimerState({
              ...parsed,
              timeLeft: newTimeLeft,
              startTime: now - (elapsed * 1000)
            })
          } else {
            // Timer completed while away - reset to default state
            setTimerState(createDefaultTimerState())
            localStorage.removeItem(TIMER_STORAGE_KEY)
          }
        } else {
          setTimerState(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading timer state, resetting to default:', error)
      // Clear corrupted state
      localStorage.removeItem(TIMER_STORAGE_KEY)
      setTimerState(createDefaultTimerState())
    }
  }, [])

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerState))
    } catch (error) {
      console.error('Error saving timer state:', error)
    }
  }, [timerState])

  // Timer interval effect with transition detection
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerState.isActive && !timerState.isPaused && timerState.timeLeft > 0) {
      // Check development mode setting from localStorage
      const developmentMode = getSettingValue('developmentMode', false)
      const intervalDuration = developmentMode ? 100 : 1000 // 10x faster in dev mode
      
      interval = setInterval(() => {
        setTimerState(prevState => {
          const newTimeLeft = prevState.timeLeft - 1
          
          if (newTimeLeft <= 0) {
            // Timer completed - play completion sound
            audioNotifications.playSessionCompleteSound()
            
            // Calculate completion data for global modal
            const totalDuration = (() => {
              if (prevState.breakDuration !== undefined && prevState.cycles !== undefined && prevState.cycles > 1) {
                return (prevState.studyDuration + prevState.breakDuration) * prevState.cycles - prevState.breakDuration
              } else if (prevState.breakDuration !== undefined && prevState.cycles !== undefined && prevState.cycles === 1) {
                return prevState.studyDuration
              } else if (prevState.breakDuration !== undefined) {
                return prevState.studyDuration + prevState.breakDuration
              }
              return prevState.studyDuration
            })()
            
            const actualDurationMinutes = Math.max(1, Math.round((totalDuration * 60) / 60))
            
            // Show desktop notification for session completion BEFORE showing the modal
            notifications.show({
              title: 'Session Complete!',
              body: `Great job! You completed a ${actualDurationMinutes} minute ${prevState.selectedMethod?.name || 'study'} session. Time to log what you learned.`,
              tag: 'session-complete',
              requireInteraction: true
            })
            
            const completionData: CompletionData = {
              method: prevState.selectedMethod?.name || 'Study Session',
              duration: actualDurationMinutes,
              breakDuration: prevState.breakDuration || 0,
              cycles: prevState.cycles || 1,
              totalDuration: totalDuration,
              completionType: 'completed'
            }
            
            return {
              ...prevState,
              isActive: false,
              timeLeft: 0,
              startTime: null,
              currentSegmentType: undefined,
              completionData
            }
          }
          
          // Check for segment transitions if we have break duration set
          if (prevState.breakDuration !== undefined && prevState.breakDuration > 0) {
            // Use cached segments or calculate once and cache them
            let segments = prevState.cachedSegments
            let needsStateUpdate = false
            
            if (!segments) {
              segments = calculateStudySegments(prevState.studyDuration, prevState.breakDuration, prevState.cycles)
              needsStateUpdate = true
            }
            
            // MULTIPLYING FACTOR APPROACH: Calculate elapsed time using the same logic as startTimer
            // This ensures consistency and guarantees cycles work
            let totalSessionDuration = prevState.studyDuration
            if (prevState.breakDuration !== undefined && prevState.cycles !== undefined && prevState.cycles > 1) {
              // Multiple cycles: (work + break) × cycles - final break
              totalSessionDuration = (prevState.studyDuration + prevState.breakDuration) * prevState.cycles - prevState.breakDuration
            } else if (prevState.breakDuration !== undefined && prevState.cycles !== undefined && prevState.cycles === 1) {
              // Single cycle: only work duration, no break (matches Session Overview)
              totalSessionDuration = prevState.studyDuration
            } else if (prevState.breakDuration !== undefined) {
              // Legacy case: work + break
              totalSessionDuration = prevState.studyDuration + prevState.breakDuration
            }
              
            const elapsedMinutes = (totalSessionDuration * 60 - newTimeLeft) / 60
            const currentSegmentInfo = getCurrentSegmentInfo(segments, elapsedMinutes)
            
            const newSegmentType = currentSegmentInfo?.isStudy ? 'study' : 'break'
            
            // Debug logging for cycles (only on segment transitions to reduce spam)
            // Add a guard to prevent duplicate logs within the same second
            const currentMinute = Math.floor(elapsedMinutes)
            if (prevState.cycles && prevState.cycles > 1 && 
                prevState.currentSegmentType && prevState.currentSegmentType !== newSegmentType &&
                !prevState.lastTransitionMinute || prevState.lastTransitionMinute !== currentMinute) {
              console.log('🔄 CYCLES DEBUG - TRANSITION:', {
                from: prevState.currentSegmentType,
                to: newSegmentType,
                segments: segments.length,
                elapsedMinutes: Math.round(elapsedMinutes * 100) / 100,
                currentSegment: currentSegmentInfo?.segment,
                cycles: prevState.cycles
              })
            }
            
            // Detect transition
            if (prevState.currentSegmentType && prevState.currentSegmentType !== newSegmentType) {
              // Check if auto-start breaks is disabled
              const autoBreaks = getSettingValue('autoBreaks', true)
              
              // Always play sounds and show notifications immediately when transitioning
              // Calculate the actual duration of the segment we're transitioning to
              const nextSegmentInfo = getCurrentSegmentInfo(segments, elapsedMinutes)
              const segmentDuration = nextSegmentInfo ? Math.ceil(nextSegmentInfo.remainingMinutes) : prevState.breakDuration || 5
              
              if (newSegmentType === 'study') {
                audioNotifications.playStudyStartSound()
                notifications.playSound('study')
                
                // Show desktop notification with conditional text
                const studyMessage = autoBreaks 
                  ? `Back to studying for ${segmentDuration} minutes. Stay focused!`
                  : `Back to studying for ${segmentDuration} minutes. Navigate to the timer and press Continue!`
                
                notifications.show({
                  title: 'Study Time!',
                  body: studyMessage,
                  tag: 'study-start',
                  requireInteraction: !autoBreaks
                })
                
              } else if (newSegmentType === 'break') {
                audioNotifications.playBreakStartSound()
                notifications.playSound('break')
                
                // Show desktop notification with conditional text
                const breakMessage = autoBreaks 
                  ? `Time for a ${segmentDuration} minute break. Rest and recharge!`
                  : `Time for a ${segmentDuration} minute break. Navigate to the timer and press Continue!`
                
                notifications.show({
                  title: 'Break Time!',
                  body: breakMessage,
                  tag: 'break-start',
                  requireInteraction: !autoBreaks
                })
              }
              
              if (!autoBreaks) {
                // Pause timer and set pending transition (sounds already played above)
                return {
                  ...prevState,
                  timeLeft: newTimeLeft,
                  isPaused: true,
                  cachedSegments: needsStateUpdate ? segments : prevState.cachedSegments,
                  pendingTransition: {
                    fromType: prevState.currentSegmentType,
                    toType: newSegmentType,
                    transitionTime: Date.now()
                  }
                }
              } else {
                // Auto-start: continue with transition (sounds already played above)
                return {
                  ...prevState,
                  timeLeft: newTimeLeft,
                  currentSegmentType: newSegmentType,
                  isBreak: newSegmentType === 'break',
                  lastTransitionMinute: Math.floor(elapsedMinutes),
                  cachedSegments: needsStateUpdate ? segments : prevState.cachedSegments
                }
              }
            }
            
            return {
              ...prevState,
              timeLeft: newTimeLeft,
              currentSegmentType: newSegmentType,
              isBreak: newSegmentType === 'break',
              lastTransitionMinute: Math.floor(elapsedMinutes),
              cachedSegments: needsStateUpdate ? segments : prevState.cachedSegments
            }
          }
          
          return {
            ...prevState,
            timeLeft: newTimeLeft
          }
        })
      }, intervalDuration)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerState.isActive, timerState.isPaused, timerState.timeLeft])

  const startTimer = (duration: number, method: StudyMethod, breakDuration?: number, cycles?: number) => {
    const now = Date.now()
    // For custom timers with break duration and cycles, calculate total time
    let totalDuration = duration
    if (breakDuration !== undefined && cycles !== undefined && cycles > 1) {
      // Multiple cycles: (work + break) × cycles - final break
      totalDuration = (duration + breakDuration) * cycles - breakDuration
    } else if (breakDuration !== undefined && cycles !== undefined && cycles === 1) {
      // Single cycle: only work duration, no break (matches Session Overview)
      totalDuration = duration
    } else if (breakDuration !== undefined) {
      // Legacy case: work + break
      totalDuration = duration + breakDuration
    }
    
    // Debug logging for timer start (only once)
    console.log('🚀 TIMER START:', {
      duration: `${duration}min`,
      breakDuration: `${breakDuration}min`,
      cycles,
      totalDuration: `${totalDuration}min (${totalDuration * 60}s)`
    })
    
    // Play start sound (always starts with study)
    audioNotifications.playStudyStartSound()
    
    setTimerState({
      isActive: true,
      isPaused: false,
      isBreak: false,
      studyDuration: duration,
      breakDuration,
      cycles,
      timeLeft: totalDuration * 60,
      startTime: now,
      selectedMethod: method,
      currentSegmentType: 'study'
    })
  }

  const pauseTimer = () => {
    setTimerState(prevState => ({
      ...prevState,
      isPaused: !prevState.isPaused,
      startTime: prevState.isPaused ? Date.now() : prevState.startTime
    }))
  }

  const resumeTimer = () => {
    setTimerState(prevState => ({
      ...prevState,
      isPaused: false,
      startTime: Date.now()
    }))
  }

  const stopTimer = () => {
    // Create completion data for manual stop if timer was running
    if (timerState.isActive && timerState.timeLeft > 0) {
      const totalDuration = (() => {
        if (timerState.breakDuration !== undefined && timerState.cycles !== undefined && timerState.cycles > 1) {
          return (timerState.studyDuration + timerState.breakDuration) * timerState.cycles - timerState.breakDuration
        } else if (timerState.breakDuration !== undefined && timerState.cycles !== undefined && timerState.cycles === 1) {
          return timerState.studyDuration
        } else if (timerState.breakDuration !== undefined) {
          return timerState.studyDuration + timerState.breakDuration
        }
        return timerState.studyDuration
      })()
      
      const totalDurationSeconds = totalDuration * 60
      const actualDurationSeconds = totalDurationSeconds - timerState.timeLeft
      const actualDurationMinutes = Math.max(1, Math.round(actualDurationSeconds / 60))
      
      const completionData: CompletionData = {
        method: timerState.selectedMethod?.name || 'Study Session',
        duration: actualDurationMinutes,
        breakDuration: timerState.breakDuration || 0,
        cycles: timerState.cycles || 1,
        totalDuration: actualDurationMinutes,
        completionType: 'manual_stop'
      }
      
      setTimerState({
        ...createDefaultTimerState(),
        completionData
      })
    } else {
      setTimerState(createDefaultTimerState())
    }
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TIMER_STORAGE_KEY)
    }
  }

  const resetTimer = () => {
    setTimerState(prevState => ({
      ...prevState,
      isActive: false,
      isPaused: false,
      timeLeft: prevState.studyDuration * 60,
      startTime: null,
      currentSegmentType: undefined,
      isBreak: false,
      pendingTransition: undefined
    }))
  }

  const isTimerRunning = () => {
    return timerState.isActive && !timerState.isPaused && timerState.timeLeft > 0
  }

  const confirmTransition = () => {
    if (!timerState.pendingTransition) return

    const { toType } = timerState.pendingTransition

    // Don't play sounds here - they were already played when the transition was detected

    setTimerState(prevState => ({
      ...prevState,
      isPaused: false,
      currentSegmentType: toType,
      isBreak: toType === 'break',
      pendingTransition: undefined,
      startTime: Date.now()
    }))
  }

  const cancelTransition = () => {
    setTimerState(prevState => ({
      ...prevState,
      isPaused: false,
      pendingTransition: undefined,
      startTime: Date.now()
    }))
  }

  const clearCompletionData = () => {
    setTimerState(prevState => ({
      ...prevState,
      completionData: undefined
    }))
  }

  const value: TimerContextType = {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    isTimerRunning,
    confirmTransition,
    cancelTransition,
    clearCompletionData
  }

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
}

export const useTimer = () => {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider')
  }
  return context
}