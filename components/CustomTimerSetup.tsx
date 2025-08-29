'use client'

import { useState } from 'react'

interface CustomTimerSetupProps {
  onSetup: (workDuration: number, breakDuration: number) => void
  onBack: () => void
}

const CustomTimerSetup = ({ onSetup, onBack }: CustomTimerSetupProps) => {
  const [workDuration, setWorkDuration] = useState('25')
  const [breakDuration, setBreakDuration] = useState('5')

  const handleSetup = () => {
    const work = parseInt(workDuration)
    const breakTime = parseInt(breakDuration)
    
    if (work > 0 && work <= 480 && breakTime >= 0 && breakTime <= 60) {
      onSetup(work, breakTime)
    }
  }

  const isValid = () => {
    const work = parseInt(workDuration)
    const breakTime = parseInt(breakDuration)
    return work > 0 && work <= 480 && breakTime >= 0 && breakTime <= 60
  }

  return (
    <div className="flex flex-col items-center space-y-8 animate-slide-in w-full max-w-xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Custom Timer
        </h2>
        <p className="text-muted">Design your perfect study session</p>
      </div>

      <div className="glass-effect rounded-2xl p-8 w-full space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <label className="block text-lg font-semibold text-foreground mb-4">
              Work Session
            </label>
            <div className="flex flex-col items-center space-y-3">
              <input
                type="number"
                value={workDuration}
                onChange={(e) => setWorkDuration(e.target.value)}
                className="w-20 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-center text-2xl font-mono focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                min="1"
                max="480"
              />
              <span className="text-muted font-medium">minutes</span>
              <div className="text-xs text-muted text-center">
                Your focused study time<br />
                (1-480 minutes)
              </div>
            </div>
          </div>

          <div className="text-center">
            <label className="block text-lg font-semibold text-foreground mb-4">
              Break Time
            </label>
            <div className="flex flex-col items-center space-y-3">
              <input
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(e.target.value)}
                className="w-20 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-center text-2xl font-mono focus:ring-2 focus:ring-warning focus:border-transparent transition-all duration-200"
                min="0"
                max="60"
              />
              <span className="text-muted font-medium">minutes</span>
              <div className="text-xs text-muted text-center">
                Your rest period<br />
                (0-60 minutes)
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Session Preview</h3>
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-foreground font-mono">{workDuration}m work</span>
              </div>
              <div className="text-muted">→</div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-warning rounded-full"></div>
                <span className="text-foreground font-mono">{breakDuration}m break</span>
              </div>
            </div>
            <div className="text-sm text-muted">
              Total cycle: {parseInt(workDuration || '0') + parseInt(breakDuration || '0')} minutes
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="bg-secondary hover:bg-border text-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Back to Methods
        </button>
        <button
          onClick={handleSetup}
          disabled={!isValid()}
          className="bg-primary hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 button-glow"
        >
          Start Custom Timer
        </button>
      </div>
    </div>
  )
}

export default CustomTimerSetup