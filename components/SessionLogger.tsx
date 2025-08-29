'use client'

import { useState, useEffect } from 'react'
import ConfettiEffect from './ConfettiEffect'
import AchievementBadge from './AchievementBadge'

interface SessionLoggerProps {
  isVisible: boolean
  duration: number
  onSave: (notes: string) => void
  onSkip: () => void
}

const SessionLogger = ({ isVisible, duration, onSave, onSkip }: SessionLoggerProps) => {
  const [notes, setNotes] = useState('')
  const [displayedPrompt, setDisplayedPrompt] = useState('')
  const [showContent, setShowContent] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [achievements, setAchievements] = useState<Array<{type: 'streak' | 'time' | 'sessions' | 'milestone', value: number}>>([])

  // Check for achievements based on duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const newAchievements = []
      
      // Time-based achievements
      if (duration >= 120) newAchievements.push({ type: 'time' as const, value: 2 })
      else if (duration >= 90) newAchievements.push({ type: 'milestone' as const, value: 1 })
      else if (duration >= 60) newAchievements.push({ type: 'time' as const, value: 1 })
      
      // Session milestone
      if (duration >= 25) newAchievements.push({ type: 'sessions' as const, value: 1 })
      
      setAchievements(newAchievements)
      
      // Trigger confetti for significant achievements
      if (duration >= 90) {
        setTimeout(() => setShowConfetti(true), 1000)
      }
    }
  }, [isVisible, duration])

  const prompts = [
    "What awesome things did you discover?",
    "Tell us about your learning journey!",
    "What clicked for you today?",
    "Share your study wins!",
    "What made you go 'Aha!'?",
    "Capture your breakthrough moments!",
    "What knowledge did you unlock?",
    "Describe your learning adventure!"
  ]

  const prompt = prompts[Math.floor(Math.random() * prompts.length)]

  useEffect(() => {
    if (isVisible) {
      setDisplayedPrompt('')
      setShowContent(false)
      
      // Typewriter effect for the prompt
      let currentIndex = 0
      const interval = setInterval(() => {
        if (currentIndex < prompt.length) {
          setDisplayedPrompt(prompt.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(interval)
          setTimeout(() => setShowContent(true), 500)
        }
      }, 50)

      return () => clearInterval(interval)
    }
  }, [isVisible, prompt])

  const handleSave = () => {
    onSave(notes)
    setNotes('')
    setShowConfetti(false)
  }

  const handleSkip = () => {
    onSkip()
    setNotes('')
    setShowConfetti(false)
  }

  const getCelebrationMessage = () => {
    if (duration >= 120) return "Incredible focus! You're a study champion! 🌟"
    if (duration >= 90) return "Amazing dedication! Keep crushing it! 🚀"
    if (duration >= 60) return "Great job staying focused! 💪"
    if (duration >= 30) return "Nice work! Every minute counts! ⭐"
    return "Good start! Building habits one session at a time! 🎯"
  }

  if (!isVisible) return null

  return (
    <>
      <ConfettiEffect isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md animate-bounce-in">
        <div className="glass-effect rounded-2xl p-8 max-w-lg w-full mx-4 transform transition-all duration-500 animate-scale-in">
        <div className="text-center mb-6">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto animate-glow-pulse">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</div>
            <div className="absolute -top-1 -left-3 text-xl animate-bounce" style={{animationDelay: '0.2s'}}>✨</div>
            <div className="absolute -bottom-1 -right-1 text-lg animate-bounce" style={{animationDelay: '0.4s'}}>🌟</div>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-2 animate-fade-in-up">
            Session Complete!
          </h2>
          <div className="text-muted mb-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            {getCelebrationMessage()}
          </div>
          <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg p-3 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              {duration} minutes
            </div>
            <div className="text-sm text-muted">of focused study time</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <label className="block text-lg font-medium text-foreground mb-3 min-h-[28px]">
              {displayedPrompt}
              {displayedPrompt.length < prompt.length && (
                <span className="animate-ping">|</span>
              )}
            </label>
            
            {showContent && (
              <div className="animate-fade-in-up">
                <div className="relative">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 bg-secondary/50 border-2 border-border rounded-xl px-4 py-3 text-foreground placeholder-muted resize-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 backdrop-blur-sm"
                    placeholder="Share your insights, breakthroughs, or what you learned..."
                    maxLength={500}
                  />
                  <div className="absolute bottom-2 right-3 text-xs text-muted">
                    {notes.length}/500
                  </div>
                </div>
              </div>
            )}
          </div>

          {showContent && (
            <div className="flex space-x-4 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <button
                onClick={handleSkip}
                className="flex-1 py-3 px-4 bg-secondary/80 text-muted rounded-xl hover:bg-border transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Skip for now
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 button-glow font-semibold"
              >
                Save & Continue
              </button>
            </div>
          )}

          {/* Achievement Badges Display */}
          {achievements.length > 0 && showContent && (
            <div className="animate-fade-in-up" style={{animationDelay: '1s'}}>
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">New Achievements! 🎉</h3>
                <div className="flex justify-center space-x-3">
                  {achievements.map((achievement, index) => (
                    <AchievementBadge
                      key={`${achievement.type}-${achievement.value}`}
                      type={achievement.type}
                      value={achievement.value}
                      isUnlocked={true}
                      className="animate-bounce-in"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </>
  )
}

export default SessionLogger