'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '../components/Navigation'
import TimerMethodSelector from '../components/TimerMethodSelector'
import DurationSelector from '../components/DurationSelector'
import CustomTimerSetup from '../components/CustomTimerSetup'
import IntegratedTimerDisplay from '../components/IntegratedTimerDisplay'
import SimpleCompletion from '../components/SimpleCompletion'
import FocusBackground from '../components/FocusBackground'
import { useTimer } from '../contexts/TimerContext'
import { useSession } from '../contexts/SessionContext'

interface TimerMethod {
  id: string
  name: string
  duration: number
  breakDuration: number
  description: string
  cycles?: number
}

type AppState = 'method-selection' | 'duration-selection' | 'custom-setup' | 'timer-ready' | 'timer-active'

export default function Home() {
  const { timerState, startTimer: startTimerContext, pauseTimer: pauseTimerContext, stopTimer: stopTimerContext } = useTimer()
  const { addSession } = useSession()
  const searchParams = useSearchParams()
  const [appState, setAppState] = useState<AppState>('method-selection')
  const [selectedMethod, setSelectedMethod] = useState<TimerMethod | null>(null)
  const [studyDuration, setStudyDuration] = useState(0)
  const [breakDuration, setBreakDuration] = useState(0)
  
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isBreak, setIsBreak] = useState(false)

  // Sync local state with timer context
  useEffect(() => {
    if (timerState.isActive) {
      setIsTimerActive(true)
      setIsPaused(timerState.isPaused)
      setStudyDuration(timerState.studyDuration)
      setAppState('timer-active')
    } else {
      setIsTimerActive(false)
      setIsPaused(false)
    }
  }, [timerState.isActive, timerState.isPaused, timerState.studyDuration])

  const resetToStart = () => {
    setAppState('method-selection')
    setSelectedMethod(null)
    setStudyDuration(0)
    setBreakDuration(0)
  }

  // Handle reset from navigation logo click
  useEffect(() => {
    const resetParam = searchParams.get('reset')
    if (resetParam === 'true') {
      setAppState('method-selection')
      setSelectedMethod(null)
      setStudyDuration(0)
      setBreakDuration(0)
      stopTimerContext()
      // Clear the URL parameter without causing a page reload
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  const [showCompletion, setShowCompletion] = useState(false)

  const handleMethodSelect = (method: TimerMethod) => {
    setSelectedMethod(method)
    if (method.id === 'custom') {
      setAppState('custom-setup')
    } else {
      setAppState('duration-selection')
    }
  }

  const handleDurationSelect = (duration: number) => {
    setStudyDuration(duration)
    
    // Calculate break duration based on method
    const breakTime = calculateBreakDuration(selectedMethod!.id, duration)
    setBreakDuration(breakTime)
    setAppState('timer-ready')
  }

  const handleCustomSetup = (workDuration: number, breakTime: number, cycles?: number) => {
    setStudyDuration(workDuration)
    setBreakDuration(breakTime)
    // Store cycles info in selectedMethod for later reference
    if (cycles && cycles > 1) {
      setSelectedMethod({ 
        id: 'custom', 
        name: `Custom (${cycles} cycles)`, 
        duration: workDuration, 
        breakDuration: breakTime, 
        description: `${workDuration}min work, ${breakTime}min break × ${cycles} cycles`,
        cycles
      })
    }
    setAppState('timer-ready')
  }

  const calculateBreakDuration = (methodId: string, duration: number) => {
    switch (methodId) {
      case 'pomodoro':
        return Math.round(duration * 0.2) // 20% of work time
      case 'fifty-ten':
        return Math.round(duration * 0.2) // 20% of work time
      case 'ninety-fifteen':
        return Math.round(duration * 0.17) // ~17% of work time
      case 'two-thirty':
        return Math.round(duration * 0.25) // 25% of work time
      default:
        return 5
    }
  }

  const startTimer = () => {
    const isCustom = selectedMethod?.id === 'custom'
    const customBreakDuration = isCustom ? breakDuration : undefined
    const cycles = isCustom && selectedMethod?.cycles ? selectedMethod.cycles : undefined
    
    startTimerContext(studyDuration, selectedMethod, customBreakDuration, cycles)
    setIsTimerActive(true)
    setIsPaused(false)
    setAppState('timer-active')
  }

  const pauseTimer = () => {
    pauseTimerContext()
    setIsPaused(!isPaused)
  }

  const stopTimer = () => {
    stopTimerContext()
    setIsTimerActive(false)
    setIsPaused(false)
    resetToStart()
  }

  const handleTimerComplete = async () => {
    // Session is complete - automatically save and show completion
    try {
      // Calculate total duration for multi-cycle sessions
      const totalDuration = selectedMethod?.cycles && selectedMethod.cycles > 1
        ? (studyDuration + breakDuration) * selectedMethod.cycles - breakDuration
        : selectedMethod?.id === 'custom' && breakDuration > 0
        ? studyDuration + breakDuration
        : studyDuration

      await addSession({
        duration: studyDuration,
        studyTopic: '',
        notes: '',
        method: selectedMethod?.name || 'Study Session',
        breakDuration: selectedMethod?.id === 'custom' ? breakDuration : undefined,
        cycles: selectedMethod?.cycles,
        totalDuration
      })
      
      setShowCompletion(true)
      setIsTimerActive(false)
    } catch (error) {
      console.error('Failed to save session:', error)
      // Still show completion even if save fails
      setShowCompletion(true)
      setIsTimerActive(false)
    }
  }

  const handleCompletionFinish = () => {
    setShowCompletion(false)
    resetToStart()
  }


  return (
    <div className="min-h-screen gradient-bg">
      <FocusBackground />
      <Navigation />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-slide-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Focus & <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Study</span>
            </h1>
          </div>

          {appState === 'method-selection' && (
            <div className="flex flex-col items-center space-y-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4 animate-slide-in">
                Choose Your Study Method
              </h2>
              <TimerMethodSelector
                selectedMethod={selectedMethod?.id || ''}
                onMethodSelect={handleMethodSelect}
              />
            </div>
          )}

          {appState === 'duration-selection' && selectedMethod && (
            <DurationSelector
              method={selectedMethod.id}
              onDurationSelect={handleDurationSelect}
              onBack={() => setAppState('method-selection')}
            />
          )}

          {appState === 'custom-setup' && (
            <CustomTimerSetup
              onSetup={handleCustomSetup}
              onBack={() => setAppState('method-selection')}
            />
          )}

          {appState === 'timer-ready' && (
            <div className="flex flex-col items-center space-y-8">
              <div className="text-center animate-slide-in">
                <h2 className="text-3xl font-semibold text-foreground mb-2">
                  Ready to Focus!
                </h2>
                <div className="glass-effect rounded-xl p-6 max-w-md mx-auto">
                  <div className="flex items-center justify-center space-x-6 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent">{studyDuration}</div>
                      <div className="text-sm text-muted">minutes work</div>
                    </div>
                    <div className="text-muted">→</div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-warning">{breakDuration}</div>
                      <div className="text-sm text-muted">minutes break</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted text-center">
                    {selectedMethod?.name} Session
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setAppState('method-selection')}
                  className="bg-secondary hover:bg-border text-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Change Setup
                </button>
                <button
                  onClick={startTimer}
                  className="bg-primary hover:bg-primary-hover text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 button-glow text-lg"
                >
                  Start Studying
                </button>
              </div>
            </div>
          )}

          {appState === 'timer-active' && (
            <div className="flex flex-col items-center space-y-8">
              <IntegratedTimerDisplay
                duration={studyDuration}
                isActive={isTimerActive}
                isPaused={isPaused}
                onComplete={handleTimerComplete}
                onSegmentChange={(segmentType) => setIsBreak(segmentType === 'break')}
              />
              
              <div className="flex space-x-4">
                <button
                  onClick={pauseTimer}
                  className="bg-warning hover:bg-warning/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={stopTimer}
                  className="bg-danger hover:bg-danger/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  End Session
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <SimpleCompletion
        isVisible={showCompletion}
        duration={selectedMethod?.cycles && selectedMethod.cycles > 1
          ? (studyDuration + breakDuration) * selectedMethod.cycles - breakDuration
          : selectedMethod?.id === 'custom' && breakDuration > 0
          ? studyDuration + breakDuration
          : studyDuration
        }
        studyMethod={selectedMethod?.name || 'Study Session'}
        onComplete={handleCompletionFinish}
      />
    </div>
  )
}
