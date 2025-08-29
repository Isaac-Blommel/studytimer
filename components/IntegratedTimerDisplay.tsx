'use client'

import { useState, useEffect } from 'react'
import PieChartTimer from './PieChartTimer'
import { calculateStudySegments, getCurrentSegmentInfo, StudySegment } from '../utils/studySegments'
import { useTimer } from '../contexts/TimerContext'
import { notifications } from '../utils/notifications'

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
  const { timerState } = useTimer()
  const [segments, setSegments] = useState<StudySegment[]>([])
  const [currentSegment, setCurrentSegment] = useState<StudySegment | null>(null)
  const [lastSegmentType, setLastSegmentType] = useState<'study' | 'break' | null>(null)
  
  // Calculate current time from timer context
  const totalDuration = (() => {
    if (timerState.breakDuration !== undefined && timerState.cycles !== undefined && timerState.cycles > 1) {
      // Multiple cycles: (work + break) × cycles - final break
      return (timerState.studyDuration + timerState.breakDuration) * timerState.cycles - timerState.breakDuration
    } else if (timerState.breakDuration !== undefined) {
      // Single cycle: work + break
      return timerState.studyDuration + timerState.breakDuration
    }
    return timerState.studyDuration
  })()
  const currentTime = (totalDuration * 60) - timerState.timeLeft

  // Initialize segments when timer context duration changes
  useEffect(() => {
    if (timerState.studyDuration > 0) {
      const newSegments = calculateStudySegments(timerState.studyDuration, timerState.breakDuration, timerState.cycles)
      setSegments(newSegments)
    }
  }, [timerState.studyDuration, timerState.breakDuration, timerState.cycles])

  // Update current segment based on elapsed time
  useEffect(() => {
    if (segments.length > 0) {
      const currentMinutes = Math.floor(currentTime / 60)
      const segmentInfo = getCurrentSegmentInfo(segments, currentMinutes)
      
      if (segmentInfo) {
        setCurrentSegment(segmentInfo.segment)
        
        // Notify parent of segment changes and show notifications
        if (lastSegmentType !== segmentInfo.segment.type) {
          setLastSegmentType(segmentInfo.segment.type)
          onSegmentChange?.(segmentInfo.segment.type)
          
          // Show notification for segment transitions
          if (timerState.isActive && !timerState.isPaused) {
            const segmentDuration = segmentInfo.segment.end - segmentInfo.segment.start
            if (segmentInfo.segment.type === 'break') {
              notifications.showBreakStart(segmentDuration)
              notifications.playSound('break')
            } else if (lastSegmentType === 'break') {
              notifications.showStudyStart(segmentDuration)
              notifications.playSound('study')
            }
          }
        }
      }
    }
  }, [currentTime, segments, lastSegmentType, onSegmentChange, timerState.isActive, timerState.isPaused])

  // Monitor timer completion
  useEffect(() => {
    if (timerState.timeLeft === 0 && totalDuration > 0) {
      // Show completion notification
      notifications.showSessionComplete(totalDuration)
      notifications.playSound('complete')
      onComplete()
    }
  }, [timerState.timeLeft, totalDuration, onComplete])


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
    <div className="flex flex-col items-center space-y-8 animate-slide-in">
      {/* Pie Chart Timer */}
      <PieChartTimer
        totalDuration={totalDuration}
        currentTime={currentTime}
        isPaused={timerState.isPaused}
        studySegments={segments}
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
                  className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 border-2 min-h-[60px] ${
                    isCurrentSegment
                      ? segment.type === 'study' 
                        ? 'bg-blue-500/20 border-blue-400 shadow-lg shadow-blue-500/25'
                        : 'bg-green-500/20 border-green-400 shadow-lg shadow-green-500/25'
                      : isPassed
                      ? 'bg-gray-800/50 border-gray-600 opacity-70'
                      : 'bg-white/5 border-white/30'
                  }`}
                >
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
                      {segment.start}m - {segment.end}m
                    </span>
                    {isCurrentSegment && (
                      <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-bold border border-white/30">
                        ACTIVE
                      </span>
                    )}
                    {isPassed && (
                      <span className="text-sm text-green-400 font-bold">✓</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default IntegratedTimerDisplay