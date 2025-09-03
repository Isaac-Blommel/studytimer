'use client'

import { useState, useEffect, useRef } from 'react'
import PieChartTimer from './PieChartTimer'
import { calculateStudySegments, getCurrentSegmentInfo, StudySegment } from '../utils/studySegments'
import { useTimer } from '../contexts/TimerContext'
import { useSettings } from '../contexts/SettingsContext'
import InAppNotification from './InAppNotification'
import TransitionConfirmation from './TransitionConfirmation'

interface IntegratedTimerDisplayProps {
  duration: number
  isActive: boolean
  isPaused: boolean
  onComplete: () => void
  onSegmentChange?: (segmentType: 'study' | 'break') => void
}

const IntegratedTimerDisplay = ({ 
  onComplete, 
  onSegmentChange 
}: IntegratedTimerDisplayProps) => {
  const { timerState, confirmTransition, cancelTransition } = useTimer()
  const { settings } = useSettings()
  const [segments, setSegments] = useState<StudySegment[]>([])
  const [currentSegment, setCurrentSegment] = useState<StudySegment | null>(null)
  const [lastSegmentType, setLastSegmentType] = useState<'study' | 'break' | null>(null)
  const completionHandledRef = useRef(false)
  const lastNotificationTimeRef = useRef<number>(0)
  const [showInAppNotification, setShowInAppNotification] = useState(false)
  const [notificationData, setNotificationData] = useState({ title: '', message: '' })
  const sessionIdRef = useRef<number>(Date.now()) // Unique ID for this timer session
  
  // Calculate current time from timer context
  const totalDuration = (() => {
    if (timerState.breakDuration !== undefined && timerState.cycles !== undefined && timerState.cycles > 1) {
      // Multiple cycles: (work + break) × cycles - final break
      return (timerState.studyDuration + timerState.breakDuration) * timerState.cycles - timerState.breakDuration
    } else if (timerState.breakDuration !== undefined && timerState.cycles !== undefined && timerState.cycles === 1) {
      // Single cycle: only work duration, no break (matches Session Overview)
      return timerState.studyDuration
    } else if (timerState.breakDuration !== undefined) {
      // Legacy case: work + break
      return timerState.studyDuration + timerState.breakDuration
    }
    return timerState.studyDuration
  })()
  const currentTime = (totalDuration * 60) - timerState.timeLeft

  // Initialize segments when timer context duration changes (ONLY when timer params change)
  useEffect(() => {
    if (timerState.studyDuration > 0) {
      const newSegments = calculateStudySegments(timerState.studyDuration, timerState.breakDuration, timerState.cycles)
      setSegments(newSegments)
      // Reset completion handler when new timer starts
      completionHandledRef.current = false
      lastNotificationTimeRef.current = 0
      
      // Generate new session ID for fresh notifications
      sessionIdRef.current = Date.now()
    }
  }, [timerState.studyDuration, timerState.breakDuration, timerState.cycles]) // Removed settings.desktopNotifications

  // Update current segment based on elapsed time
  useEffect(() => {
    if (segments.length > 0) {
      const currentMinutes = Math.floor(currentTime / 60)
      const segmentInfo = getCurrentSegmentInfo(segments, currentMinutes)
      
      if (segmentInfo) {
        setCurrentSegment(segmentInfo.segment)
        
        // Notify parent of segment changes and show notifications
        if (lastSegmentType !== segmentInfo.segment.type) {
          const currentMinutes = Math.floor(currentTime / 60)
          const transitionTime = segmentInfo.segment.start
          
          setLastSegmentType(segmentInfo.segment.type)
          onSegmentChange?.(segmentInfo.segment.type)
          
          // Show notification for segment transitions - only if we haven't notified for this exact transition
          if (timerState.isActive && !timerState.isPaused && lastNotificationTimeRef.current !== transitionTime) {
            lastNotificationTimeRef.current = transitionTime
            
            if (segmentInfo.segment.type === 'break') {
              // Show study complete notification when transitioning from study to break
              if (lastSegmentType === 'study') {
                // Show in-app notification for study completion (keep this for visual feedback)
                setNotificationData({
                  title: 'Study Session Complete!',
                  message: `Great work! You just finished a focused study session. Time for a well-deserved break.`
                })
                setShowInAppNotification(true)
              }
            }
            // Note: Desktop notifications and sounds are now handled centrally in TimerContext
          }
        }
      }
    }
  }, [currentTime, segments, lastSegmentType, onSegmentChange, timerState.isActive, timerState.isPaused, settings.desktopNotifications, settings.autoBreaks])

  // Monitor timer completion with guard to prevent multiple calls
  useEffect(() => {
    if (timerState.timeLeft === 0 && totalDuration > 0 && timerState.isActive && !completionHandledRef.current) {
      // Mark as handled immediately to prevent duplicate calls
      completionHandledRef.current = true
      
      // Show in-app notification for session completion (keep this for visual feedback)
      setNotificationData({
        title: 'Session Complete!',
        message: `Amazing work! You just completed ${totalDuration} minutes of focused studying. Keep it up!`
      })
      setShowInAppNotification(true)
      
      // Note: Desktop notifications and sounds are now handled centrally in TimerContext
      
      onComplete()
    }
  }, [timerState.timeLeft, totalDuration, timerState.isActive, settings.desktopNotifications]) // Remove onComplete from deps


  const getStatusMessage = () => {
    if (timerState.isPaused) return 'Timer Paused'
    if (!currentSegment) return 'Ready to start'
    
    if (currentSegment.type === 'study') {
      return 'Focus time - stay concentrated!'
    } else {
      return 'Break time - relax and recharge!'
    }
  }

  const getStatusColor = () => {
    if (timerState.isPaused) return 'text-warning'
    if (currentSegment?.type === 'break') return 'text-green-500'
    return 'text-primary'
  }

  return (
    <>
      <InAppNotification
        show={showInAppNotification}
        title={notificationData.title}
        message={notificationData.message}
        type="success"
        duration={6000}
        onClose={() => setShowInAppNotification(false)}
      />
      
      <TransitionConfirmation
        show={!!timerState.pendingTransition}
        fromType={timerState.pendingTransition?.fromType || 'study'}
        toType={timerState.pendingTransition?.toType || 'break'}
        onConfirm={confirmTransition}
        onCancel={() => {}} // No cancel functionality needed
      />
      <div className="flex flex-col items-center space-y-8 animate-slide-in">
      {/* Development Mode Indicator */}
      {settings.developmentMode && (
        <div className="bg-warning/20 border-2 border-warning text-warning px-4 py-2 rounded-lg font-bold text-sm animate-pulse">
          DEVELOPMENT MODE - 10X SPEED
        </div>
      )}
      
      {/* Pie Chart Timer */}
      <PieChartTimer
        totalDuration={totalDuration}
        currentTime={currentTime}
        isPaused={timerState.isPaused}
      />

      {/* Status indicator */}
      {timerState.isActive && (
        <div className={`flex items-center space-x-3 text-lg font-medium animate-pulse-gentle ${getStatusColor()}`}>
          <div className={`w-3 h-3 rounded-full bg-current ${timerState.isPaused ? 'animate-pulse' : 'animate-ping'}`} />
          <span>{getStatusMessage()}</span>
        </div>
      )}

      {/* Session overview */}
      {segments.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-md w-full border border-white/20">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Session Overview</h3>
          <div className="space-y-4">
            {segments.map((segment, index) => {
              const isCurrentSegment = currentSegment === segment
              const isPassed = currentTime >= segment.end * 60
              
              return (
                <div
                  key={index}
                  className={`relative flex items-center justify-between p-4 rounded-lg transition-all duration-300 border-2 min-h-[60px] ${
                    isCurrentSegment
                      ? segment.type === 'study' 
                        ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/25'
                        : 'bg-green-500/20 border-green-400 shadow-lg shadow-green-500/25'
                      : isPassed
                      ? 'bg-gray-800/50 border-gray-600 opacity-70'
                      : 'bg-white/5 border-white/30'
                  }`}
                >
                  {/* Active indicator - positioned absolutely to not affect layout */}
                  {isCurrentSegment && (
                    <div className="absolute -top-1 -right-1">
                      <span className="text-xs bg-gradient-to-r from-primary to-accent text-white px-2 py-1 rounded-full font-bold shadow-lg animate-pulse">
                        ACTIVE
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      segment.type === 'study' 
                        ? isCurrentSegment ? 'bg-blue-400 border-blue-300' : 'bg-blue-500 border-blue-400'
                        : isCurrentSegment ? 'bg-green-400 border-green-300' : 'bg-green-500 border-green-400'
                    }`} />
                    <span className={`font-bold text-lg flex-shrink-0 ${
                      isCurrentSegment ? 'text-white' : 'text-gray-100'
                    }`}>
                      {segment.type === 'study' ? 'Study' : 'Break'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <span className={`text-base font-medium ${
                      isCurrentSegment ? 'text-white' : 'text-gray-200'
                    }`}>
                      {segment.end - segment.start} min
                    </span>
                    {isPassed && (
                      <span className="text-xs text-green-400 font-bold">DONE</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      </div>
    </>
  )
}

export default IntegratedTimerDisplay