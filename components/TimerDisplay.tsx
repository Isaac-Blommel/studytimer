'use client'

import { useState, useEffect } from 'react'

interface TimerDisplayProps {
  duration: number
  isActive: boolean
  isPaused: boolean
  isBreak: boolean
  onComplete: () => void
}

const TimerDisplay = ({ duration, isActive, isPaused, isBreak, onComplete }: TimerDisplayProps) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60)

  useEffect(() => {
    setTimeLeft(duration * 60)
  }, [duration])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            onComplete()
            return 0
          }
          return time - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, isPaused, timeLeft, onComplete])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100

  return (
    <div className="flex flex-col items-center space-y-8 animate-slide-in">
      <div className={`relative w-80 h-80 rounded-full flex items-center justify-center transition-all duration-500 ${
        isBreak ? 'timer-glow bg-gradient-to-br from-warning/20 to-warning/5' : 'timer-glow bg-gradient-to-br from-accent/20 to-accent/5'
      }`}>
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-border"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 45}`}
            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
            className={`transition-all duration-1000 ease-linear ${
              isBreak ? 'text-warning' : 'text-accent'
            }`}
            strokeLinecap="round"
          />
        </svg>
        
        <div className="text-center z-10">
          <div className={`text-6xl font-mono font-bold mb-2 transition-colors duration-300 ${
            isBreak ? 'text-warning' : 'text-accent'
          }`}>
            {formatTime(timeLeft)}
          </div>
          <div className="text-lg text-muted font-medium">
            {isBreak ? 'Break Time' : 'Focus Time'}
          </div>
        </div>
      </div>

      {isActive && (
        <div className={`flex items-center space-x-2 text-sm font-medium animate-pulse-gentle ${
          isBreak ? 'text-warning' : 'text-accent'
        }`}>
          <div className="w-2 h-2 rounded-full bg-current animate-ping" />
          <span>{isPaused ? 'Paused' : isBreak ? 'Take a break!' : 'Stay focused!'}</span>
        </div>
      )}
    </div>
  )
}

export default TimerDisplay