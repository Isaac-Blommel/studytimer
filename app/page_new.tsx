'use client'

import { useState, useEffect } from 'react'
import Navigation from '../components/Navigation'
import TimerMethodSelector from '../components/TimerMethodSelector'
import DurationSelector from '../components/DurationSelector'
import CustomTimerSetup from '../components/CustomTimerSetup'
import SessionNotesModal from '../components/SessionNotesModal'
import SimpleCompletion from '../components/SimpleCompletion'
import FocusBackground from '../components/FocusBackground'
import { useSession } from '../contexts/SessionContext'

interface TimerMethod {
  id: string
  name: string
  duration: number
  breakDuration: number
  description: string
  cycles?: number
}

type AppState = 'method-selection' | 'duration-selection' | 'custom-setup' | 'timer-running' | 'session-notes' | 'completion'

interface SessionData {
  method: string
  duration: number
  breakDuration: number
  cycles: number
  startTime: number
  endTime: number
  completionType: 'completed' | 'manual_stop'
}

export default function Home() {
  const { addSession } = useSession()
  
  // App state
  const [appState, setAppState] = useState<AppState>('method-selection')
  
  // Timer method selection
  const [selectedMethod, setSelectedMethod] = useState<TimerMethod | null>(null)
  const [studyDuration, setStudyDuration] = useState(0)
  const [breakDuration, setBreakDuration] = useState(0)
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState(0)
  
  // Session data for notes modal
  const [currentSessionData, setCurrentSessionData] = useState<SessionData | null>(null)
  
  // Completion state
  const [showCompletion, setShowCompletion] = useState(false)
  
  // Test button state
  const [isTestingSave, setIsTestingSave] = useState(false)

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer completed naturally
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, isPaused, timeLeft])

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
    setStudyDuration(duration)
    setBreakDuration(breakDur || calculateBreakDuration(selectedMethod!.id, duration))
    
    // Update selected method with cycles if provided
    if (cycles && cycles > 1) {
      setSelectedMethod({
        ...selectedMethod!,
        cycles,
        name: `${selectedMethod!.name} (${cycles} cycles)`
      })
    }
    
    startTimer(duration)
  }

  const handleCustomSetup = (workDuration: number, breakTime: number, cycles?: number) => {
    setStudyDuration(workDuration)
    setBreakDuration(breakTime)
    
    const method = {
      id: 'custom',
      name: cycles && cycles > 1 ? `Custom (${cycles} cycles)` : 'Custom Timer',
      duration: workDuration,
      breakDuration: breakTime,
      description: `${workDuration}min work, ${breakTime}min break`,
      cycles
    }
    
    setSelectedMethod(method)
    startTimer(workDuration)
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

  // Timer control functions
  const startTimer = (duration: number) => {
    console.log('🚀 Starting timer for', duration, 'minutes')
    setTimeLeft(duration * 60) // Convert to seconds
    setIsRunning(true)
    setIsPaused(false)
    setSessionStartTime(Date.now())
    setAppState('timer-running')
  }

  const pauseTimer = () => {
    console.log('⏸️ Pausing timer')
    setIsPaused(!isPaused)
  }

  const stopTimer = () => {
    console.log('🛑 Stopping timer manually')
    handleSessionEnd('manual_stop')
  }

  const handleTimerComplete = () => {
    console.log('✅ Timer completed naturally')
    setIsRunning(false)
    handleSessionEnd('completed')
  }

  const handleSessionEnd = (completionType: 'completed' | 'manual_stop') => {
    console.log('🎯 Session ending:', completionType)
    
    // Stop timer
    setIsRunning(false)
    setIsPaused(false)
    
    // Calculate actual duration (how much time was used)
    const totalDurationSeconds = studyDuration * 60
    const actualDurationSeconds = totalDurationSeconds - timeLeft
    const actualDurationMinutes = Math.max(1, Math.round(actualDurationSeconds / 60)) // Minimum 1 minute
    
    // Create session data
    const sessionData: SessionData = {
      method: selectedMethod?.name || 'Study Session',
      duration: actualDurationMinutes,
      breakDuration: breakDuration || 0,
      cycles: selectedMethod?.cycles || 1,
      startTime: sessionStartTime,
      endTime: Date.now(),
      completionType
    }
    
    console.log('📊 Session data created:', sessionData)
    
    // Store session data and show notes modal
    setCurrentSessionData(sessionData)
    setAppState('session-notes')
  }

  const handleSaveStudyNotes = async (studyTopic: string, notes: string) => {
    console.log('💾 Saving study notes:', { studyTopic, notes })
    
    if (!currentSessionData) {
      console.error('No session data found!')
      return
    }

    try {
      // Create final session data matching test button format
      const finalSessionData = {
        duration: currentSessionData.duration,
        studyTopic: studyTopic.trim() || 'No topic specified',
        notes: notes.trim() || 'No notes provided',
        method: currentSessionData.method,
        breakDuration: currentSessionData.breakDuration,
        cycles: currentSessionData.cycles,
        totalDuration: currentSessionData.duration, // Simplified for now
        completionStatus: currentSessionData.completionType,
        methodVariation: `${currentSessionData.duration}/${currentSessionData.breakDuration}`
      }
      
      console.log('📝 Final session data for Supabase:', finalSessionData)
      
      // Use the same addSession function that works for the test button
      await addSession(finalSessionData)
      
      console.log('✅ Session saved successfully!')
      
      // Show completion screen
      setAppState('completion')
      setShowCompletion(true)
      
    } catch (error) {
      console.error('❌ Failed to save session:', error)
      alert('Failed to save your study session. Please try again.')
    }
  }

  const handleSkipStudyNotes = async () => {
    console.log('⏭️ Skipping study notes')
    await handleSaveStudyNotes('', '')
  }

  const handleCompletionFinish = () => {
    // Reset everything and go back to method selection
    setShowCompletion(false)
    setCurrentSessionData(null)
    setSelectedMethod(null)
    setStudyDuration(0)
    setBreakDuration(0)
    setTimeLeft(0)
    setAppState('method-selection')
  }

  // Test button function (same as before)
  const handleTestSaveSession = async () => {
    setIsTestingSave(true)
    console.log('🧪 Testing session save pipeline...')
    
    try {
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
      
      await addSession(testSessionData)
      alert('✅ SUCCESS! Test session saved to database. Check your Profile → Study History to see it.')
      
    } catch (error) {
      console.error('❌ Test session save failed:', error)
      alert('❌ FAILED! Test session could not be saved. Check console for details.')
    } finally {
      setIsTestingSave(false)
    }
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
              
              {/* Test Button */}
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
                  {isTestingSave && (
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
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  {selectedMethod?.name} Session
                </h2>
                <div className="text-6xl font-bold text-primary mb-4">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-muted">
                  {isPaused ? '⏸️ Paused' : '🎯 Focus Time'}
                </div>
              </div>
              
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
                  End Study Session
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Study Notes Modal */}
      <SessionNotesModal
        isVisible={appState === 'session-notes'}
        duration={currentSessionData?.duration || 0}
        method={currentSessionData?.method || 'Study Session'}
        onSave={handleSaveStudyNotes}
        onSkip={handleSkipStudyNotes}
      />

      {/* Completion Screen */}
      <SimpleCompletion
        isVisible={showCompletion}
        duration={currentSessionData?.duration || 0}
        onComplete={handleCompletionFinish}
      />
    </div>
  )
}