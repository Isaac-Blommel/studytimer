'use client'

import { useState } from 'react'
import { useTimer } from '../contexts/TimerContext'
import { useSession } from '../contexts/SessionContext'

const GlobalTimerCompleteModal = () => {
  const { timerState, clearCompletionData } = useTimer()
  const { addSession } = useSession()
  const [studyTopic, setStudyTopic] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!timerState.completionData || isSaving) return
    
    setIsSaving(true)
    try {
      const { completionData } = timerState
      
      const finalSessionData = {
        duration: completionData.duration,
        studyTopic: studyTopic.trim() || 'No topic specified',
        notes: notes.trim() || 'No notes provided',
        method: completionData.method,
        breakDuration: completionData.breakDuration,
        cycles: completionData.cycles,
        totalDuration: completionData.totalDuration,
        completionStatus: completionData.completionType,
        methodVariation: `${completionData.duration}/${completionData.breakDuration}`
      }
      
      await addSession(finalSessionData)
      
      // Reset form and close modal
      setStudyTopic('')
      setNotes('')
      clearCompletionData()
      
    } catch (error) {
      console.error('Failed to save session:', error)
      alert('Failed to save your study session. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSkip = async () => {
    if (isSaving) return
    await handleSave() // Save with empty values
  }

  // Don't show if no completion data
  if (!timerState.completionData) {
    return null
  }

  const { completionData } = timerState

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-8 max-w-md w-full border border-border shadow-2xl animate-slide-in">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Great Session!</h2>
          <p className="text-muted">
            You just completed a <span className="font-semibold text-primary">{completionData.duration} minute</span> {completionData.method} session
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudyTopic(e.target.value)}
              placeholder="e.g., Calculus derivatives, Spanish vocabulary, History chapter 5..."
              className="w-full p-3 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted focus:border-primary focus:outline-none transition-colors"
              maxLength={100}
              autoFocus
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
              Session notes <span className="text-muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="How did the session go? What did you accomplish? Any challenges?"
              className="w-full p-3 rounded-lg border border-border bg-secondary/50 text-foreground placeholder-muted focus:border-primary focus:outline-none transition-colors resize-none"
              rows={3}
              maxLength={500}
              disabled={isSaving}
            />
          </div>

          <div className="text-xs text-muted text-right">
            {notes.length}/500 characters
          </div>
        </div>

        <div className="flex space-x-3 mt-8">
          <button
            onClick={handleSkip}
            disabled={isSaving}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Session'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GlobalTimerCompleteModal