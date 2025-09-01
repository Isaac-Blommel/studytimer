'use client'

import { useState } from 'react'

interface SessionNotesModalProps {
  isVisible: boolean
  duration: number
  method: string
  onSave: (studyTopic: string, notes: string) => void
  onSkip: () => void
}

const SessionNotesModal = ({ 
  isVisible, 
  duration, 
  method, 
  onSave, 
  onSkip 
}: SessionNotesModalProps) => {
  const [studyTopic, setStudyTopic] = useState('')
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    onSave(studyTopic.trim(), notes.trim())
    // Reset form
    setStudyTopic('')
    setNotes('')
  }

  const handleSkip = () => {
    onSkip()
    // Reset form
    setStudyTopic('')
    setNotes('')
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-8 max-w-md w-full border border-border shadow-2xl animate-slide-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Great Session!</h2>
          <p className="text-muted">
            You just completed a <span className="font-semibold text-primary">{duration} minute</span> {method} session
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="studyTopic" className="block text-sm font-medium text-foreground mb-2">
              What did you study? <span className="text-primary">*Required for session tracking*</span>
            </label>
            <input
              id="studyTopic"
              type="text"
              value={studyTopic}
              onChange={(e) => setStudyTopic(e.target.value)}
              placeholder="e.g., Calculus derivatives, Spanish vocabulary, History chapter 5..."
              className="w-full p-3 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted focus:border-primary focus:outline-none transition-colors"
              maxLength={100}
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
              Session notes <span className="text-muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the session go? What did you accomplish? Any challenges?"
              className="w-full p-3 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted focus:border-primary focus:outline-none transition-colors resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="text-xs text-muted text-right">
            {notes.length}/500 characters
          </div>
        </div>

        <div className="flex space-x-3 mt-8">
          <button
            onClick={handleSkip}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-300"
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Save Session
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionNotesModal