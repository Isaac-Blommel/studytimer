'use client'

import { useEffect, useState } from 'react'

interface SimpleCompletionProps {
  isVisible: boolean
  duration: number
  onComplete: () => void
}

const SimpleCompletion = ({ isVisible, duration, onComplete }: SimpleCompletionProps) => {
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowMessage(true)
      
      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onComplete()
        setShowMessage(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete])

  if (!isVisible || !showMessage) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="glass-effect rounded-2xl p-8 max-w-md w-full mx-4 text-center animate-scale-in">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Congratulations!
          </h2>
          
          <p className="text-lg text-muted mb-2">
            You studied for <span className="font-semibold text-accent">{duration} minutes</span>
          </p>
          
          <p className="text-sm text-muted">
            Session automatically saved to your study logs
          </p>
        </div>

        <div className="text-xs text-muted opacity-75">
          Closing automatically...
        </div>
      </div>
    </div>
  )
}

export default SimpleCompletion