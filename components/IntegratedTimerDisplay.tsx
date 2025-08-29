'use client'

import { useState, useEffect } from 'react'
import PieChartTimer from './PieChartTimer'
import { calculateStudySegments, getCurrentSegmentInfo, shouldTransition, StudySegment } from '../utils/studySegments'

interface IntegratedTimerDisplayProps {
  duration: number
  isActive: boolean
  isPaused: boolean
  onComplete: () => void
  onSegmentChange?: (segmentType: 'study' | 'break') => void
}

const IntegratedTimerDisplay = ({ 
  duration, 
  isActive, 
  isPaused, 
  onComplete, 
  onSegmentChange 
}: IntegratedTimerDisplayProps) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60)
  const [currentTime, setCurrentTime] = useState(0) // elapsed time in seconds
  const [segments, setSegments] = useState<StudySegment[]>([])
  const [currentSegment, setCurrentSegment] = useState<StudySegment | null>(null)
  const [lastSegmentType, setLastSegmentType] = useState<'study' | 'break' | null>(null)

  // Initialize segments when duration changes
  useEffect(() => {
    const newSegments = calculateStudySegments(duration)
    setSegments(newSegments)
    setTimeLeft(duration * 60)
    setCurrentTime(0)
  }, [duration])

  // Update current segment based on elapsed time
  useEffect(() => {
    if (segments.length > 0) {
      const currentMinutes = Math.floor(currentTime / 60)
      const segmentInfo = getCurrentSegmentInfo(segments, currentMinutes)
      
      if (segmentInfo) {
        setCurrentSegment(segmentInfo.segment)
        
        // Notify parent of segment changes
        if (lastSegmentType !== segmentInfo.segment.type) {
          setLastSegmentType(segmentInfo.segment.type)
          onSegmentChange?.(segmentInfo.segment.type)
        }
      }
    }
  }, [currentTime, segments, lastSegmentType, onSegmentChange])

  // Timer logic
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
        
        setCurrentTime((time) => time + 1)
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

  const getStatusMessage = () => {
    if (isPaused) return 'Timer Paused'
    if (!currentSegment) return 'Ready to start'
    
    if (currentSegment.type === 'study') {
      return 'Focus time - stay concentrated!'
    } else {
      return 'Break time - relax and recharge!'
    }
  }

  const getStatusColor = () => {
    if (isPaused) return 'text-warning'
    if (currentSegment?.type === 'break') return 'text-green-500'
    return 'text-primary'
  }

  return (
    <div className="flex flex-col items-center space-y-8 animate-slide-in">
      {/* Pie Chart Timer */}
      <PieChartTimer
        totalDuration={duration}
        currentTime={currentTime}
        isPaused={isPaused}
        studySegments={segments}
      />

      {/* Status indicator */}
      {isActive && (
        <div className={`flex items-center space-x-3 text-lg font-medium animate-pulse-gentle ${getStatusColor()}`}>
          <div className={`w-3 h-3 rounded-full bg-current ${isPaused ? 'animate-pulse' : 'animate-ping'}`} />
          <span>{getStatusMessage()}</span>
        </div>
      )}

      {/* Session overview */}
      {segments.length > 0 && (
        <div className="glass-effect rounded-xl p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Session Overview</h3>
          <div className="space-y-3">
            {segments.map((segment, index) => {
              const isCurrentSegment = currentSegment === segment
              const isPassed = currentTime >= segment.end * 60
              
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                    isCurrentSegment
                      ? segment.type === 'study' 
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-green-100 border border-green-300'
                      : isPassed
                      ? 'bg-gray-100 opacity-60'
                      : 'bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      segment.type === 'study' ? 'bg-blue-500' : 'bg-green-500'
                    }`} />
                    <span className={`font-medium ${
                      isCurrentSegment ? 'text-foreground' : 'text-muted'
                    }`}>
                      {segment.type === 'study' ? 'Study' : 'Break'}
                    </span>
                  </div>
                  <div className={`text-sm ${
                    isCurrentSegment ? 'text-foreground font-medium' : 'text-muted'
                  }`}>
                    {segment.start}m - {segment.end}m
                    {isCurrentSegment && (
                      <span className="ml-2 text-xs bg-current text-white px-2 py-1 rounded-full">
                        Active
                      </span>
                    )}
                    {isPassed && (
                      <span className="ml-2 text-xs text-green-600">✓</span>
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