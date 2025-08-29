'use client'

import { useState } from 'react'

interface SessionLoggerProps {
  isVisible: boolean
  duration: number
  onSave: (notes: string) => void
  onSkip: () => void
}

const SessionLogger = ({ isVisible, duration, onSave, onSkip }: SessionLoggerProps) => {
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    onSave(notes)
    setNotes('')
  }

  const handleSkip = () => {
    onSkip()
    setNotes('')
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm animate-slide-in">
      <div className="glass-effect rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Session Complete!</h2>
          <p className="text-muted">
            You studied for <span className="text-accent font-medium">{duration} minutes</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              What did you learn today?
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-32 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted resize-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder="Describe what you studied, key concepts learned, or any insights..."
              maxLength={500}
            />
            <div className="text-right text-xs text-muted mt-1">
              {notes.length}/500
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              className="flex-1 py-3 px-4 bg-secondary text-muted rounded-lg hover:bg-border transition-all duration-200 hover:scale-105"
            >
              Skip
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-200 transform hover:scale-105 button-glow"
            >
              Save Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionLogger