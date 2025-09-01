'use client'

import { useState } from 'react'
import { TIMER_LIMITS } from '../constants/timer'

interface CustomTimerSetupProps {
  onSetup: (workDuration: number, breakDuration: number, cycles?: number) => void
  onBack: () => void
}

const CustomTimerSetup = ({ onSetup, onBack }: CustomTimerSetupProps) => {
  const [workDuration, setWorkDuration] = useState('25')
  const [breakDuration, setBreakDuration] = useState('5')
  const [cycles, setCycles] = useState(1)

  const handleSetup = () => {
    const work = parseInt(workDuration)
    const breakDurationValue = parseInt(breakDuration)
    
    if (work >= TIMER_LIMITS.MIN_WORK_DURATION && work <= TIMER_LIMITS.MAX_WORK_DURATION && breakDurationValue >= TIMER_LIMITS.MIN_BREAK_DURATION && breakDurationValue <= TIMER_LIMITS.MAX_BREAK_DURATION) {
      // MULTIPLYING FACTOR: Always pass cycles value to guarantee cycling works
      console.log('🔧 Custom timer setup:', { work, breakDurationValue, cycles })
      onSetup(work, breakDurationValue, cycles)
    }
  }

  const isValid = () => {
    const work = parseInt(workDuration)
    const breakDurationValue = parseInt(breakDuration)
    return work >= TIMER_LIMITS.MIN_WORK_DURATION && work <= TIMER_LIMITS.MAX_WORK_DURATION && breakDurationValue >= TIMER_LIMITS.MIN_BREAK_DURATION && breakDurationValue <= TIMER_LIMITS.MAX_BREAK_DURATION && cycles >= TIMER_LIMITS.MIN_CYCLES && cycles <= TIMER_LIMITS.MAX_CYCLES
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
              Total time: ~{(parseInt(workDuration || '0') + parseInt(breakDuration || '0')) * cycles} minutes
            </div>
          </div>
        </div>
      </div>

      <div className="w-full glass-effect rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
          Number of Cycles
        </h3>
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setCycles(Math.max(1, cycles - 1))}
            className={`w-10 h-10 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              cycles <= 1 
                ? 'bg-secondary/30 text-foreground/30 cursor-not-allowed' 
                : 'bg-secondary hover:bg-border text-foreground'
            }`}
            disabled={cycles <= 1}
          >
            −
          </button>
          <div className="text-center mx-4">
            <div className="text-2xl font-bold text-accent">{cycles}</div>
            <div className="text-sm text-muted">cycle{cycles !== 1 ? 's' : ''}</div>
          </div>
          <button
            onClick={() => setCycles(Math.min(10, cycles + 1))}
            className={`w-10 h-10 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              cycles >= 10 
                ? 'bg-secondary/30 text-foreground/30 cursor-not-allowed' 
                : 'bg-secondary hover:bg-border text-foreground'
            }`}
            disabled={cycles >= 10}
          >
            +
          </button>
        </div>
        <div className="text-center mt-4 text-sm text-muted">
          Total time: ~{(parseInt(workDuration || '0') + parseInt(breakDuration || '0')) * cycles} minutes
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
          Start Studying
        </button>
      </div>
    </div>
  )
}

export default CustomTimerSetup