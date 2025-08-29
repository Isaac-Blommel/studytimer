'use client'

import { useState, useEffect } from 'react'

interface PieChartTimerProps {
  totalDuration: number // in minutes
  currentTime: number // in seconds
  isPaused: boolean
  studySegments: Array<{ start: number; end: number; type: 'study' | 'break' }>
}

const PieChartTimer = ({ totalDuration, currentTime, isPaused, studySegments }: PieChartTimerProps) => {
  const radius = 120
  const circumference = 2 * Math.PI * radius
  const center = 150

  // Calculate current segment
  const currentMinutes = Math.floor(currentTime / 60)
  const currentSegment = studySegments.find(segment => 
    currentMinutes >= segment.start && currentMinutes < segment.end
  )

  // Create pie chart segments
  const createSegmentPath = (startAngle: number, endAngle: number, isInner = false) => {
    const innerRadius = isInner ? radius - 20 : radius
    const outerRadius = radius
    
    const startAngleRad = (startAngle - 90) * (Math.PI / 180)
    const endAngleRad = (endAngle - 90) * (Math.PI / 180)
    
    const x1 = center + innerRadius * Math.cos(startAngleRad)
    const y1 = center + innerRadius * Math.sin(startAngleRad)
    const x2 = center + outerRadius * Math.cos(startAngleRad)
    const y2 = center + outerRadius * Math.sin(startAngleRad)
    
    const x3 = center + outerRadius * Math.cos(endAngleRad)
    const y3 = center + outerRadius * Math.sin(endAngleRad)
    const x4 = center + innerRadius * Math.cos(endAngleRad)
    const y4 = center + innerRadius * Math.sin(endAngleRad)
    
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    
    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`
  }

  // Convert time to angle (360 degrees = totalDuration)
  const timeToAngle = (minutes: number) => (minutes / totalDuration) * 360

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getRemainingTime = () => {
    return (totalDuration * 60) - currentTime
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Pie Chart */}
      <div className="relative">
        <svg width="300" height="300" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgb(var(--border))"
            strokeWidth="2"
            opacity="0.3"
          />
          
          {/* Segment paths */}
          {studySegments.map((segment, index) => {
            const startAngle = timeToAngle(segment.start)
            const endAngle = timeToAngle(segment.end)
            const segmentPath = createSegmentPath(startAngle, endAngle)
            
            return (
              <path
                key={index}
                d={segmentPath}
                fill={segment.type === 'study' ? 'rgb(59 130 246 / 0.7)' : 'rgb(34 197 94 / 0.7)'}
                stroke={segment.type === 'study' ? 'rgb(59 130 246)' : 'rgb(34 197 94)'}
                strokeWidth="2"
                className={`transition-all duration-300 ${
                  currentSegment === segment ? 'brightness-125 drop-shadow-lg' : ''
                }`}
              />
            )
          })}
          
          {/* Progress indicator */}
          <circle
            cx={center}
            cy={center}
            r={radius + 10}
            fill="none"
            stroke="rgb(var(--primary))"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(currentTime / (totalDuration * 60)) * (2 * Math.PI * (radius + 10))} ${2 * Math.PI * (radius + 10)}`}
            className={`transition-all duration-1000 ${isPaused ? 'stroke-warning' : ''}`}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-4xl font-bold transition-colors duration-300 ${
            isPaused ? 'text-warning' : currentSegment?.type === 'break' ? 'text-green-500' : 'text-primary'
          }`}>
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-muted mt-1">
            {formatTime(getRemainingTime())} remaining
          </div>
          {currentSegment && (
            <div className={`text-lg font-medium mt-2 px-3 py-1 rounded-full text-white ${
              currentSegment.type === 'study' ? 'bg-blue-500' : 'bg-green-500'
            }`}>
              {currentSegment.type === 'study' ? 'Study Time' : 'Break Time'}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-foreground">Study ({studySegments.filter(s => s.type === 'study').reduce((acc, s) => acc + (s.end - s.start), 0)}m)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-foreground">Break ({studySegments.filter(s => s.type === 'break').reduce((acc, s) => acc + (s.end - s.start), 0)}m)</span>
        </div>
      </div>

      {/* Current segment info */}
      {currentSegment && (
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-sm text-muted mb-1">
            {currentSegment.type === 'study' ? 'Focus on your studies' : 'Take a well-deserved break'}
          </div>
          <div className="text-lg font-medium text-foreground">
            {currentSegment.type === 'study' ? 'Study Session' : 'Break Time'} • {currentSegment.end - currentSegment.start} minutes
          </div>
        </div>
      )}
    </div>
  )
}

export default PieChartTimer