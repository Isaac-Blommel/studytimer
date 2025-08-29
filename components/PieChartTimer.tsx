'use client'

import React from 'react'

interface PieChartTimerProps {
  totalDuration: number // in minutes
  currentTime: number // in seconds
  isPaused: boolean
  studySegments: Array<{ start: number; end: number; type: 'study' | 'break' }>
}

const PieChartTimer = ({ totalDuration, currentTime, isPaused }: PieChartTimerProps) => {
  const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds)
    const mins = Math.floor(safeSeconds / 60)
    const secs = safeSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getRemainingTime = () => {
    return Math.max(0, (totalDuration * 60) - currentTime)
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center">
        <div className={`text-8xl font-bold mb-4 ${
          isPaused ? 'text-orange-500' : 'text-blue-500'
        }`}>
          {formatTime(currentTime)}
        </div>
        <div className="text-2xl text-gray-400">
          {formatTime(getRemainingTime())} remaining
        </div>
      </div>
    </div>
  )
}

export default PieChartTimer