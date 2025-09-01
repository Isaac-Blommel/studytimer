'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { audioNotifications } from '@/utils/audioNotifications'
import { calculateStudySegments, getCurrentSegmentInfo } from '@/utils/studySegments'

type StudyMethod = {
  id: string
  name: string
  cycles?: number
} | null

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
  pendingTransition?: {
    fromType: 'study' | 'break'
    toType: 'study' | 'break'
    transitionTime: number
  }
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
  pendingTransition: undefined
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
            return {
              ...prevState,
              isActive: false,
              timeLeft: 0,
              startTime: null,
              currentSegmentType: undefined
            }
          }
          
          // Check for segment transitions if we have break duration set
          if (prevState.breakDuration !== undefined && prevState.breakDuration > 0) {
            const segments = calculateStudySegments(prevState.studyDuration, prevState.breakDuration, prevState.cycles)
            
            // MULTIPLYING FACTOR APPROACH: Calculate elapsed time using the same logic as startTimer
            // This ensures consistency and guarantees cycles work
            let totalSessionDuration = prevState.studyDuration
            if (prevState.breakDuration !== undefined && prevState.cycles !== undefined && prevState.cycles > 1) {
              // Multiple cycles: (work + break) × cycles - final break
              totalSessionDuration = (prevState.studyDuration + prevState.breakDuration) * prevState.cycles - prevState.breakDuration
            } else if (prevState.breakDuration !== undefined) {
              // Single cycle: work + break
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
              
              if (!autoBreaks) {
                // Pause timer and set pending transition
                return {
                  ...prevState,
                  timeLeft: newTimeLeft,
                  isPaused: true,
                  pendingTransition: {
                    fromType: prevState.currentSegmentType,
                    toType: newSegmentType,
                    transitionTime: Date.now()
                  }
                }
              } else {
                // Auto-start: continue with transition
                // Play transition sound
                if (newSegmentType === 'study') {
                  audioNotifications.playStudyStartSound()
                } else if (newSegmentType === 'break') {
                  audioNotifications.playBreakStartSound()
                }
                
                return {
                  ...prevState,
                  timeLeft: newTimeLeft,
                  currentSegmentType: newSegmentType,
                  isBreak: newSegmentType === 'break',
                  lastTransitionMinute: Math.floor(elapsedMinutes)
                }
              }
            }
            
            return {
              ...prevState,
              timeLeft: newTimeLeft,
              currentSegmentType: newSegmentType,
              isBreak: newSegmentType === 'break',
              lastTransitionMinute: Math.floor(elapsedMinutes)
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
    } else if (breakDuration !== undefined) {
      // Single cycle: work + break
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
    setTimerState(createDefaultTimerState())
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

    // Play transition sound
    if (toType === 'study') {
      audioNotifications.playStudyStartSound()
    } else if (toType === 'break') {
      audioNotifications.playBreakStartSound()
    }

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

  const value: TimerContextType = {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    isTimerRunning,
    confirmTransition,
    cancelTransition
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