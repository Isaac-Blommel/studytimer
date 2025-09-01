'use client'

import { useEffect } from 'react'

interface InAppNotificationProps {
  show: boolean
  title: string
  message: string
  type?: 'success' | 'info' | 'warning' | 'error'
  duration?: number
  onClose: () => void
}

const InAppNotification = ({ 
  show, 
  title, 
  message, 
  type = 'success', 
  duration = 5000,
  onClose 
}: InAppNotificationProps) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 text-white border-green-400'
      case 'info':
        return 'bg-blue-500/90 text-white border-blue-400'
      case 'warning':
        return 'bg-yellow-500/90 text-white border-yellow-400'
      case 'error':
        return 'bg-red-500/90 text-white border-red-400'
      default:
        return 'bg-green-500/90 text-white border-green-400'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'OK'
      case 'info':
        return 'i'
      case 'warning':
        return '!'
      case 'error':
        return 'X'
      default:
        return 'OK'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`
        max-w-sm rounded-xl shadow-lg border-2 p-4 backdrop-blur-md
        transform transition-all duration-300 hover:scale-105
        ${getTypeStyles()}
      `}>
        <div className="flex items-start space-x-3">
          <div className="text-2xl flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg mb-1">{title}</h4>
            <p className="text-sm opacity-90">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

export default InAppNotification