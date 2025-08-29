'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import TimerMethodSelector from '../components/TimerMethodSelector'
import TimerDisplay from '../components/TimerDisplay'
import SessionLogger from '../components/SessionLogger'

interface TimerMethod {
  id: string
  name: string
  duration: number
  breakDuration: number
  description: string
}

export default function Home() {
  const [selectedMethod, setSelectedMethod] = useState('')
  const [currentMethod, setCurrentMethod] = useState<TimerMethod | null>(null)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [showLogger, setShowLogger] = useState(false)
  const [sessions, setSessions] = useState<Array<{ duration: number, notes: string, timestamp: Date }>>([])

  const handleMethodSelect = (method: TimerMethod) => {
    setSelectedMethod(method.id)
    setCurrentMethod(method)
  }

  const startTimer = () => {
    if (currentMethod) {
      setIsTimerActive(true)
      setIsPaused(false)
    }
  }

  const pauseTimer = () => {
    setIsPaused(!isPaused)
  }

  const stopTimer = () => {
    setIsTimerActive(false)
    setIsPaused(false)
    setIsBreak(false)
  }

  const handleTimerComplete = () => {
    if (!isBreak && currentMethod) {
      setShowLogger(true)
      setIsTimerActive(false)
    } else {
      setIsBreak(false)
      setIsTimerActive(false)
    }
  }

  const handleSessionSave = (notes: string) => {
    if (currentMethod) {
      setSessions(prev => [...prev, {
        duration: currentMethod.duration,
        notes,
        timestamp: new Date()
      }])
    }
    setShowLogger(false)
    startBreak()
  }

  const handleSessionSkip = () => {
    setShowLogger(false)
    startBreak()
  }

  const startBreak = () => {
    if (currentMethod) {
      setIsBreak(true)
      setIsTimerActive(true)
      setIsPaused(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-slide-in">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Focus & <span className="text-gradient bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Study</span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Automate your study sessions with timed breaks to prevent burnout and maximize productivity.
            </p>
          </div>

          {!isTimerActive && !currentMethod && (
            <div className="flex flex-col items-center space-y-8">
              <h2 className="text-2xl font-semibold text-foreground mb-4 animate-slide-in">
                Choose Your Study Method
              </h2>
              <TimerMethodSelector
                selectedMethod={selectedMethod}
                onMethodSelect={handleMethodSelect}
              />
              
              {selectedMethod && (
                <button
                  onClick={startTimer}
                  className="bg-primary hover:bg-primary-hover text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 button-glow animate-slide-in text-lg"
                >
                  Start Studying
                </button>
              )}
            </div>
          )}

          {!isTimerActive && currentMethod && !showLogger && (
            <div className="flex flex-col items-center space-y-8">
              <div className="text-center animate-slide-in">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Ready to start {currentMethod.name}?
                </h2>
                <p className="text-muted">
                  {currentMethod.duration} minutes of focused study time
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={startTimer}
                  className="bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 button-glow"
                >
                  Start Timer
                </button>
                <button
                  onClick={() => setCurrentMethod(null)}
                  className="bg-secondary hover:bg-border text-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Change Method
                </button>
              </div>
            </div>
          )}

          {isTimerActive && currentMethod && (
            <div className="flex flex-col items-center space-y-8">
              <TimerDisplay
                duration={isBreak ? currentMethod.breakDuration : currentMethod.duration}
                isActive={isTimerActive}
                isPaused={isPaused}
                isBreak={isBreak}
                onComplete={handleTimerComplete}
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

      <SessionLogger
        isVisible={showLogger}
        duration={currentMethod?.duration || 0}
        onSave={handleSessionSave}
        onSkip={handleSessionSkip}
      />
    </div>
  )
}
