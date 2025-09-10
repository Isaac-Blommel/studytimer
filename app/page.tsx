'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '../components/Navigation'
import TimerMethodSelector from '../components/TimerMethodSelector'
import DurationSelector from '../components/DurationSelector'
import CustomTimerSetup from '../components/CustomTimerSetup'
import SimpleCompletion from '../components/SimpleCompletion'
import FocusBackground from '../components/FocusBackground'
import IntegratedTimerDisplay from '../components/IntegratedTimerDisplay'
import { useTimer } from '../contexts/TimerContext'

interface TimerMethod {
  id: string
  name: string
  duration: number
  breakDuration: number
  description: string
  cycles?: number
}

type AppState = 'method-selection' | 'duration-selection' | 'custom-setup' | 'timer-running' | 'completion'


export default function Home() {
  const { timerState, startTimer: startTimerContext, pauseTimer: pauseTimerContext, stopTimer: stopTimerContext } = useTimer()
  const searchParams = useSearchParams()
  
  // App state - start with method-selection but check for active timer
  const [appState, setAppState] = useState<AppState>('method-selection')
  
  // Timer method selection
  const [selectedMethod, setSelectedMethod] = useState<TimerMethod | null>(null)
  const [studyDuration, setStudyDuration] = useState(0)
  const [breakDuration, setBreakDuration] = useState(0)
  
  
  // Completion state
  const [showCompletion, setShowCompletion] = useState(false)
  

  const handleCompletionFinish = useCallback(() => {
    // Reset everything and go back to method selection
    setShowCompletion(false)
    setSelectedMethod(null)
    setStudyDuration(0)
    setBreakDuration(0)
    setAppState('method-selection')
    // Also reset timer context
    stopTimerContext()
  }, [stopTimerContext])

  // Handle reset from navigation logo click
  useEffect(() => {
    const resetParam = searchParams.get('reset')
    if (resetParam === 'true') {
      handleCompletionFinish() // Reset everything
      stopTimerContext() // Also stop the context timer
      // Clear the URL parameter without causing a page reload
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams, handleCompletionFinish, stopTimerContext])

  // Check if we should show the timer interface when page loads or timer state changes
  useEffect(() => {
    // If there's an active timer and we're not already showing it, switch to timer-running
    if (timerState.isActive && appState !== 'timer-running' && appState !== 'completion') {
      console.log('🔄 Active timer detected, switching to timer-running view')
      
      // Restore the timer settings from the context
      setStudyDuration(timerState.studyDuration)
      setBreakDuration(timerState.breakDuration || 0)
      
      // Recreate the method object from timer state
      if (timerState.selectedMethod) {
        setSelectedMethod({
          id: timerState.selectedMethod.id,
          name: timerState.selectedMethod.name,
          duration: timerState.studyDuration,
          breakDuration: timerState.breakDuration || 0,
          description: `${timerState.studyDuration}min work, ${timerState.breakDuration || 0}min break`,
          cycles: timerState.selectedMethod.cycles
        })
      }
      
      setAppState('timer-running')
    }
    // If timer is not active and we're showing timer-running, go back to method selection
    else if (!timerState.isActive && appState === 'timer-running') {
      console.log('🔄 Timer not active, switching back to method selection')
      // Don't reset immediately - let the normal completion flow handle it
    }
  }, [timerState.isActive, timerState.studyDuration, timerState.breakDuration, timerState.selectedMethod, appState])


  // Method selection handlers
  const handleMethodSelect = (method: TimerMethod) => {
    setSelectedMethod(method)
    if (method.id === 'custom') {
      setAppState('custom-setup')
    } else {
      setAppState('duration-selection')
    }
  }

  const handleDurationSelect = (duration: number, breakDur?: number, cycles?: number) => {
    const actualBreakDuration = breakDur || calculateBreakDuration(selectedMethod!.id, duration)
    
    setStudyDuration(duration)
    setBreakDuration(actualBreakDuration)
    
    // Create method object with all the data BEFORE starting timer (same as custom timer approach)
    const method = {
      ...selectedMethod!,
      cycles,
      name: cycles && cycles > 1 ? `${selectedMethod!.name} (${cycles} cycles)` : selectedMethod!.name,
      duration: duration,
      breakDuration: actualBreakDuration
    }
    
    setSelectedMethod(method)
    
    // Use startTimerWithValues instead of startTimer to pass exact values
    startTimerWithValues(duration, actualBreakDuration, method, cycles)
  }

  const handleCustomSetup = (workDuration: number, breakTime: number, cycles?: number) => {
    console.log('🎛️ CUSTOM SETUP:', { workDuration, breakTime, cycles })
    
    // Create method object with all the data BEFORE starting timer
    const method = {
      id: 'custom',
      name: cycles && cycles > 1 ? `Custom (${cycles} cycles)` : 'Custom Timer',
      duration: workDuration,
      breakDuration: breakTime,
      description: `${workDuration}min work, ${breakTime}min break`,
      cycles
    }
    
    // Set state (this happens async)
    setStudyDuration(workDuration)
    setBreakDuration(breakTime)
    setSelectedMethod(method)
    
    // Start timer with direct values, not state
    startTimerWithValues(workDuration, breakTime, method, cycles)
  }

  const calculateBreakDuration = (methodId: string, duration: number) => {
    switch (methodId) {
      case 'pomodoro':
        return Math.round(duration * 0.2)
      case 'fifty-ten':
        return Math.round(duration * 0.2)
      case 'ninety-fifteen':
        return Math.round(duration * 0.17)
      case 'two-hour':
        return Math.round(duration * 0.25)
      default:
        return 5
    }
  }


  // New function that takes direct values instead of relying on state
  const startTimerWithValues = (duration: number, breakTime: number, method: TimerMethod, cycles?: number) => {
    console.log('🚀 Starting timer with direct values:', { duration, breakTime, cycles })
    setAppState('timer-running')
    
    // Start timer context with direct values
    const methodObj = {
      id: method.id,
      name: method.name,
      cycles: cycles
    }
    startTimerContext(duration, methodObj, breakTime, cycles)
  }

  const pauseTimer = () => {
    console.log('⏸️ Pausing timer')
    pauseTimerContext()
  }

  const stopTimer = () => {
    console.log('🛑 Stopping timer manually')
    stopTimerContext()
    // Manual stop completion is now handled globally in TimerContext
    setAppState('method-selection')
    setSelectedMethod(null)
    setStudyDuration(0)
    setBreakDuration(0)
  }

  const handleTimerComplete = () => {
    console.log('✅ Timer completed naturally')
    // Timer completion is now handled globally in TimerContext
    // Just reset the app state
    setAppState('method-selection')
    setSelectedMethod(null)
    setStudyDuration(0)
    setBreakDuration(0)
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

          {/* Method Selection */}
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

          {/* Duration Selection */}
          {appState === 'duration-selection' && selectedMethod && (
            <DurationSelector
              method={selectedMethod.id}
              onDurationSelect={handleDurationSelect}
              onBack={() => setAppState('method-selection')}
            />
          )}

          {/* Custom Setup */}
          {appState === 'custom-setup' && (
            <CustomTimerSetup
              onSetup={handleCustomSetup}
              onBack={() => setAppState('method-selection')}
            />
          )}

          {/* Timer Running */}
          {appState === 'timer-running' && (
            <div className="flex flex-col items-center space-y-8">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  {selectedMethod?.name} Session
                </h2>
                <div className="text-muted text-sm">
                  {selectedMethod?.cycles && selectedMethod.cycles > 1 && (
                    `${selectedMethod.cycles} cycles: ${studyDuration}min work + ${breakDuration}min break`
                  )}
                  {(!selectedMethod?.cycles || selectedMethod.cycles <= 1) && (
                    `${studyDuration}min work + ${breakDuration}min break`
                  )}
                </div>
              </div>
              
              <IntegratedTimerDisplay
                duration={studyDuration}
                isActive={timerState.isActive}
                isPaused={timerState.isPaused}
                onComplete={handleTimerComplete}
                onSegmentChange={(segmentType) => {
                  console.log(`🔄 Segment changed to: ${segmentType}`)
                }}
              />
              
              <div className="flex space-x-4">
                {timerState.isActive && timerState.timeLeft > 0 && (
                  <button
                    onClick={pauseTimer}
                    className="bg-warning hover:bg-warning/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {timerState.isPaused ? 'Resume' : 'Pause'}
                  </button>
                )}
                <button
                  onClick={stopTimer}
                  className="bg-danger hover:bg-danger/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  End Study Session
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Completion Screen */}
      <SimpleCompletion
        isVisible={showCompletion}
        duration={0}
        onComplete={handleCompletionFinish}
      />
    </div>
  )
}