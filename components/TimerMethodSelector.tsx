'use client'

import { useState } from 'react'

interface TimerMethod {
  id: string
  name: string
  duration: number
  breakDuration: number
  description: string
}

const timerMethods: TimerMethod[] = [
  {
    id: 'pomodoro',
    name: 'Pomodoro',
    duration: 25,
    breakDuration: 5,
    description: '25 min work, 5 min break'
  },
  {
    id: 'fifty-ten',
    name: '50/10 Method',
    duration: 50,
    breakDuration: 10,
    description: '50 min work, 10 min break'
  },
  {
    id: 'ninety-fifteen',
    name: '90/15 Method',
    duration: 90,
    breakDuration: 15,
    description: '90 min work, 15 min break'
  },
  {
    id: 'two-thirty',
    name: '2 Hour Deep Work',
    duration: 120,
    breakDuration: 30,
    description: '2 hour work, 30 min break'
  }
]

interface TimerMethodSelectorProps {
  selectedMethod: string
  onMethodSelect: (method: TimerMethod) => void
}

const TimerMethodSelector = ({ selectedMethod, onMethodSelect }: TimerMethodSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl animate-slide-in">
      {timerMethods.map((method, index) => (
        <div
          key={method.id}
          className={`glass-effect rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 button-glow ${
            selectedMethod === method.id
              ? 'ring-2 ring-primary bg-primary/10 scale-105'
              : 'hover:bg-card/50'
          }`}
          onClick={() => onMethodSelect(method)}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">{method.name}</h3>
            <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              selectedMethod === method.id 
                ? 'border-primary bg-primary' 
                : 'border-muted'
            }`} />
          </div>
          
          <p className="text-muted text-sm mb-4">{method.description}</p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex flex-col">
              <span className="text-accent font-medium">Work Time</span>
              <span className="text-foreground font-mono">{method.duration} min</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col">
              <span className="text-warning font-medium">Break Time</span>
              <span className="text-foreground font-mono">{method.breakDuration} min</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TimerMethodSelector