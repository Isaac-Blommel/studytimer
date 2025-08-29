'use client'

import { useState } from 'react'

interface CustomTimerSetupProps {
  onSetup: (workDuration: number, breakDuration: number, cycles?: number) => void
  onBack: () => void
}

const CustomTimerSetup = ({ onSetup, onBack }: CustomTimerSetupProps) => {
  const [workDuration, setWorkDuration] = useState('25')
  const [breakDuration, setBreakDuration] = useState('5')
  const [enableCycles, setEnableCycles] = useState(false)
  const [cycleCount, setCycleCount] = useState('3')

  const handleSetup = () => {
    const work = parseInt(workDuration)
    const breakTime = parseInt(breakDuration)
    const cycles = enableCycles ? parseInt(cycleCount) : undefined
    
    if (work > 0 && work <= 480 && breakTime >= 0 && breakTime <= 60) {
      onSetup(work, breakTime, cycles)
    }
  }

  const isValid = () => {
    const work = parseInt(workDuration)
    const breakTime = parseInt(breakDuration)
    const cycles = enableCycles ? parseInt(cycleCount) : 1
    return work > 0 && work <= 480 && breakTime >= 0 && breakTime <= 60 && cycles > 0 && cycles <= 10
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

        <div className="border-t border-border pt-6 space-y-6">
          {/* Cycling Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCycles}
                  onChange={(e) => setEnableCycles(e.target.checked)}
                  className="w-5 h-5 text-primary bg-secondary border-border rounded focus:ring-primary focus:ring-2"
                />
                <span className="text-lg font-semibold text-foreground">Repeat Cycles</span>
              </label>
            </div>
            
            {enableCycles && (
              <div className="flex items-center justify-center space-x-4">
                <span className="text-foreground font-medium">Number of cycles:</span>
                <input
                  type="number"
                  value={cycleCount}
                  onChange={(e) => setCycleCount(e.target.value)}
                  className="w-16 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground text-center text-lg font-mono focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  min="1"
                  max="10"
                />
              </div>
            )}
          </div>

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
              {enableCycles ? (
                <div>
                  <div>Single cycle: {parseInt(workDuration || '0') + parseInt(breakDuration || '0')} minutes</div>
                  <div className="font-bold text-accent">Total time: {(parseInt(workDuration || '0') + parseInt(breakDuration || '0')) * parseInt(cycleCount || '1')} minutes ({parseInt(cycleCount || '1')} cycles)</div>
                </div>
              ) : (
                <div>Total cycle: {parseInt(workDuration || '0') + parseInt(breakDuration || '0')} minutes</div>
              )}
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