'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface TimerState {
  isActive: boolean
  isPaused: boolean
  isBreak: boolean
  studyDuration: number
  timeLeft: number
  startTime: number | null
  selectedMethod: unknown
}

interface TimerContextType {
  timerState: TimerState
  startTimer: (duration: number, method: unknown) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  isTimerRunning: () => boolean
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

const TIMER_STORAGE_KEY = 'study-timer-state'

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    isPaused: false,
    isBreak: false,
    studyDuration: 0,
    timeLeft: 0,
    startTime: null,
    selectedMethod: null
  })

  // Load timer state from localStorage on mount
  useEffect(() => {
    // Only access localStorage on client-side
    if (typeof window === 'undefined') return
    
    try {
      const savedState = localStorage.getItem(TIMER_STORAGE_KEY)
      if (savedState) {
        const parsed = JSON.parse(savedState)
        
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
            // Timer completed while away
            setTimerState({
              ...parsed,
              isActive: false,
              timeLeft: 0
            })
          }
        } else {
          setTimerState(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error)
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

  // Timer interval effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerState.isActive && !timerState.isPaused && timerState.timeLeft > 0) {
      interval = setInterval(() => {
        setTimerState(prevState => {
          const newTimeLeft = prevState.timeLeft - 1
          
          if (newTimeLeft <= 0) {
            // Timer completed
            return {
              ...prevState,
              isActive: false,
              timeLeft: 0,
              startTime: null
            }
          }
          
          return {
            ...prevState,
            timeLeft: newTimeLeft
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerState.isActive, timerState.isPaused, timerState.timeLeft])

  const startTimer = (duration: number, method: unknown) => {
    const now = Date.now()
    setTimerState({
      isActive: true,
      isPaused: false,
      isBreak: false,
      studyDuration: duration,
      timeLeft: duration * 60,
      startTime: now,
      selectedMethod: method
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
    setTimerState({
      isActive: false,
      isPaused: false,
      isBreak: false,
      studyDuration: 0,
      timeLeft: 0,
      startTime: null,
      selectedMethod: null
    })
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
      startTime: null
    }))
  }

  const isTimerRunning = () => {
    return timerState.isActive && !timerState.isPaused && timerState.timeLeft > 0
  }

  const value: TimerContextType = {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    isTimerRunning
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