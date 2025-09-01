'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Navigation from '../components/Navigation'
import TimerMethodSelector from '../components/TimerMethodSelector'
import DurationSelector from '../components/DurationSelector'
import CustomTimerSetup from '../components/CustomTimerSetup'
import IntegratedTimerDisplay from '../components/IntegratedTimerDisplay'
import SimpleCompletion from '../components/SimpleCompletion'
import SessionNotesModal from '../components/SessionNotesModal'
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

type AppState = 'method-selection' | 'duration-selection' | 'custom-setup' | 'timer-active'

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
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [sessionToSave, setSessionToSave] = useState<any>(null)
  const [isTestingSave, setIsTestingSave] = useState(false)

  const handleMethodSelect = (method: TimerMethod) => {
    setSelectedMethod(method)
    if (method.id === 'custom') {
      setAppState('custom-setup')
    } else {
      setAppState('duration-selection')
    }
  }

  const handleDurationSelect = (duration: number, breakDuration?: number, cycles?: number) => {
    setStudyDuration(duration)
    
    // Use the provided break duration or calculate it
    const breakTime = breakDuration ?? calculateBreakDuration(selectedMethod!.id, duration)
    setBreakDuration(breakTime)
    
    // Update selected method with cycles info if provided
    if (cycles && cycles > 1) {
      setSelectedMethod({
        ...selectedMethod!,
        cycles,
        name: `${selectedMethod!.name} (${cycles} cycles)`
      })
    }
    
    // Start the timer immediately instead of going to timer-ready screen
    const method = cycles && cycles > 1 ? {
      ...selectedMethod!,
      cycles,
      name: `${selectedMethod!.name} (${cycles} cycles)`
    } : selectedMethod!
    
    startTimerContext(duration, method, breakTime, cycles)
    setIsTimerActive(true)
    setIsPaused(false)
    setAppState('timer-active')
  }

  const handleCustomSetup = (workDuration: number, breakTime: number, cycles?: number) => {
    setStudyDuration(workDuration)
    setBreakDuration(breakTime)
    
    // Create the method object with cycles info
    const method = {
      id: 'custom', 
      name: cycles && cycles > 1 ? `Custom (${cycles} cycles)` : 'Custom Timer',
      duration: workDuration, 
      breakDuration: breakTime, 
      description: cycles && cycles > 1 
        ? `${workDuration}min work, ${breakTime}min break × ${cycles} cycles`
        : `${workDuration}min work, ${breakTime}min break`,
      cycles
    }
    
    setSelectedMethod(method)
    
    // Start the timer immediately
    startTimerContext(workDuration, method, breakTime, cycles)
    setIsTimerActive(true)
    setIsPaused(false)
    setAppState('timer-active')
  }

  const calculateBreakDuration = (methodId: string, duration: number) => {
    switch (methodId) {
      case 'pomodoro':
        return Math.round(duration * 0.2) // 20% of work time
      case 'fifty-ten':
        return Math.round(duration * 0.2) // 20% of work time
      case 'ninety-fifteen':
        return Math.round(duration * 0.17) // ~17% of work time
      case 'two-hour':
        return Math.round(duration * 0.25) // 25% of work time
      default:
        return 5
    }
  }


  const pauseTimer = () => {
    pauseTimerContext()
    setIsPaused(!isPaused)
  }

  const stopTimer = () => {
    console.log('🛑 STOP TIMER CALLED! Timer active:', isTimerActive)
    console.log('🛑 Timer state details:', { studyDuration, selectedMethod, timerState })
    
    // Check timer state BEFORE stopping it
    const wasTimerActive = isTimerActive
    
    // Stop the timer context first
    stopTimerContext()
    setIsTimerActive(false)
    setIsPaused(false)
    
    // Always save session when manually stopped (even if 0 minutes as per requirement)
    if (wasTimerActive) {
      const sessionData = createSessionData('manual_stop')
      console.log('📋 Session data created for manual stop:', sessionData)
      setSessionToSave(sessionData)
      setShowNotesModal(true)
      console.log('🎯 Should show notes modal for manual stop!')
      // DON'T call resetToStart() here - let the modal handle it
    } else {
      console.log('❌ Timer wasn\'t active, just resetting')
      // Timer wasn't active, just reset
      resetToStart()
    }
  }

  const createSessionData = useCallback((completionStatus: 'completed' | 'manual_stop') => {
    // Calculate total duration for multi-cycle sessions with proper defaults
    const safeDuration = studyDuration || 0
    const safeBreakDuration = breakDuration || 0
    const safeCycles = selectedMethod?.cycles || 1
    
    const totalDuration = safeCycles > 1
      ? (safeDuration + safeBreakDuration) * safeCycles - safeBreakDuration
      : selectedMethod?.id === 'custom' && safeBreakDuration > 0
      ? safeDuration + safeBreakDuration
      : safeDuration

    // Determine method variation (e.g., "25/5", "50/10") with defaults
    let methodVariation = ''
    if (selectedMethod?.id !== 'custom' && safeDuration > 0) {
      methodVariation = `${safeDuration}/${safeBreakDuration}`
    } else if (selectedMethod?.id === 'custom') {
      methodVariation = 'Custom'
    }

    return {
      duration: safeDuration,                           // GUARANTEED NUMBER
      studyTopic: '',                                  // WILL BE FILLED BY NOTES MODAL
      notes: '',                                       // WILL BE FILLED BY NOTES MODAL  
      method: selectedMethod?.name || 'Study Session', // GUARANTEED STRING
      breakDuration: safeBreakDuration,                // GUARANTEED NUMBER
      cycles: safeCycles,                              // GUARANTEED NUMBER
      totalDuration: totalDuration,                    // GUARANTEED NUMBER
      completionStatus: completionStatus,              // GUARANTEED STRING
      methodVariation: methodVariation || 'Standard'  // GUARANTEED STRING
    }
  }, [selectedMethod, studyDuration, breakDuration])

  const saveSessionWithNotes = async (sessionData: any, studyTopic: string, notes: string) => {
    try {
      // Create final session data with GUARANTEED defaults just like test button
      const finalSessionData = {
        duration: Number(sessionData.duration) || 0,
        studyTopic: String(studyTopic || 'No topic specified').trim(),
        notes: String(notes || 'No notes provided').trim(),
        method: String(sessionData.method) || 'Study Session',
        breakDuration: Number(sessionData.breakDuration) || 0,
        cycles: Number(sessionData.cycles) || 1,
        totalDuration: Number(sessionData.totalDuration) || Number(sessionData.duration) || 0,
        completionStatus: String(sessionData.completionStatus) || 'completed',
        methodVariation: String(sessionData.methodVariation) || 'Standard'
      }
      
      console.log('💾 Final session data being saved:', finalSessionData)
      await addSession(finalSessionData)
      console.log('✅ Session successfully saved!')
    } catch (error) {
      console.error('Failed to save session:', error)
      throw error
    }
  }

  const handleTimerComplete = useCallback(() => {
    console.log('🚨 TIMER COMPLETE HANDLER CALLED!')
    // Timer completed - show notes modal instead of immediately saving
    const sessionData = createSessionData('completed')
    console.log('📋 Session data created for completed timer:', sessionData)
    setSessionToSave(sessionData)
    setShowNotesModal(true)
    setIsTimerActive(false)
    console.log('🎯 Should show notes modal now!')
  }, [createSessionData])

  const handleCompletionFinish = () => {
    setShowCompletion(false)
    resetToStart()
  }

  const handleSaveNotes = async (studyTopic: string, notes: string) => {
    if (sessionToSave) {
      try {
        await saveSessionWithNotes(sessionToSave, studyTopic, notes)
        setShowNotesModal(false)
        setSessionToSave(null)
        setShowCompletion(true)
      } catch (error) {
        console.error('Failed to save session:', error)
        // Still show completion even if save fails
        setShowNotesModal(false)
        setSessionToSave(null)
        setShowCompletion(true)
      }
    }
  }

  const handleSkipNotes = async () => {
    if (sessionToSave) {
      try {
        await saveSessionWithNotes(sessionToSave, '', '')
        setShowNotesModal(false)
        setSessionToSave(null)
        setShowCompletion(true)
      } catch (error) {
        console.error('Failed to save session:', error)
        // Still show completion even if save fails
        setShowNotesModal(false)
        setSessionToSave(null)
        setShowCompletion(true)
      }
    }
  }

  const handleTestSaveSession = async () => {
    setIsTestingSave(true)
    console.log('🧪 Testing session save pipeline...')
    
    try {
      // Create test session data using the exact same pipeline
      const testSessionData = {
        duration: 5,
        studyTopic: 'Test Session - Pipeline Verification',
        notes: `Test session created at ${new Date().toLocaleTimeString()} to verify database connection and session saving pipeline.`,
        method: 'Test Method',
        breakDuration: 0,
        cycles: 1,
        totalDuration: 5,
        completionStatus: 'completed',
        methodVariation: '5/0'
      }
      
      console.log('📝 Test session data:', testSessionData)
      
      // Use the exact same save function as real sessions
      await addSession(testSessionData)
      
      console.log('✅ Test session saved successfully!')
      
      // Show success feedback
      setTimeout(() => {
        alert('✅ SUCCESS! Test session saved to database. Check your Profile → Study History to see it.')
      }, 100)
      
    } catch (error) {
      console.error('❌ Test session save failed:', error)
      alert('❌ FAILED! Test session could not be saved. Check console for details.')
    } finally {
      setIsTestingSave(false)
    }
  }

  // Debug state right before render
  console.log('🎭 RENDER STATE CHECK:', { 
    showNotesModal, 
    sessionToSave, 
    appState, 
    isTimerActive 
  })

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
              
              {/* Temporary Test Button */}
              <div className="mt-8 pt-8 border-t border-border/30">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted">🧪 Development Testing</p>
                </div>
                <button
                  onClick={handleTestSaveSession}
                  disabled={isTestingSave}
                  className={`relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed ${
                    isTestingSave ? 'animate-pulse' : ''
                  }`}
                >
                  {/* Sparkle effect */}
                  {!isTestingSave && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  )}
                  
                  <div className="relative flex items-center justify-center space-x-2">
                    {isTestingSave ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span>Test Database Save</span>
                        <span>⚡</span>
                      </>
                    )}
                  </div>
                </button>
                <div className="text-center mt-2">
                  <p className="text-xs text-muted">Adds a 5min test session to verify pipeline</p>
                </div>
              </div>
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
                {/* Only show pause button if timer is not completed */}
                {timerState.timeLeft > 0 && (
                  <button
                    onClick={pauseTimer}
                    className="bg-warning hover:bg-warning/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                )}
                <button
                  onClick={() => {
                    console.log('🔴 END STUDY SESSION BUTTON CLICKED!')
                    stopTimer()
                  }}
                  className="bg-danger hover:bg-danger/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  End Study Session
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <SessionNotesModal
        isVisible={showNotesModal}
        duration={selectedMethod?.cycles && selectedMethod.cycles > 1
          ? (studyDuration + breakDuration) * selectedMethod.cycles - breakDuration
          : selectedMethod?.id === 'custom' && breakDuration > 0
          ? studyDuration + breakDuration
          : studyDuration
        }
        method={selectedMethod?.name || 'Study Session'}
        onSave={handleSaveNotes}
        onSkip={handleSkipNotes}
      />

      <SimpleCompletion
        isVisible={showCompletion}
        duration={selectedMethod?.cycles && selectedMethod.cycles > 1
          ? (studyDuration + breakDuration) * selectedMethod.cycles - breakDuration
          : selectedMethod?.id === 'custom' && breakDuration > 0
          ? studyDuration + breakDuration
          : studyDuration
        }
        onComplete={handleCompletionFinish}
      />
    </div>
  )
}
