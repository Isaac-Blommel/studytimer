'use client'

import { useState } from 'react'

interface DurationSelectorProps {
  method: string
  onDurationSelect: (duration: number) => void
  onBack: () => void
}

const DurationSelector = ({ method, onDurationSelect, onBack }: DurationSelectorProps) => {
  const [customDuration, setCustomDuration] = useState('')
  const [selectedPreset, setSelectedPreset] = useState('')

  const getPresetDurations = () => {
    switch (method) {
      case 'pomodoro':
        return [15, 25, 35, 45]
      case 'fifty-ten':
        return [30, 50, 70, 90]
      case 'ninety-fifteen':
        return [60, 90, 120, 180]
      case 'two-thirty':
        return [90, 120, 180, 240]
      case 'custom':
        return []
      default:
        return [25, 50, 90, 120]
    }
  }

  const presetDurations = getPresetDurations()

  const handlePresetSelect = (duration: number) => {
    setSelectedPreset(duration.toString())
    setCustomDuration('')
    onDurationSelect(duration)
  }

  const handleCustomSubmit = () => {
    const duration = parseInt(customDuration)
    if (duration > 0 && duration <= 480) { // Max 8 hours
      onDurationSelect(duration)
    }
  }

  const formatMethodName = (methodId: string) => {
    const names: { [key: string]: string } = {
      'pomodoro': 'Pomodoro',
      'fifty-ten': '50/10 Method',
      'ninety-fifteen': '90/15 Method',
      'two-thirty': '2 Hour Deep Work',
      'custom': 'Custom Timer'
    }
    return names[methodId] || methodId
  }

  return (
    <div className="flex flex-col items-center space-y-8 animate-slide-in w-full max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {formatMethodName(method)}
        </h2>
        <p className="text-muted">How long do you want to study?</p>
      </div>

      {method !== 'custom' && presetDurations.length > 0 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            Recommended Durations
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {presetDurations.map((duration, index) => (
              <button
                key={duration}
                onClick={() => handlePresetSelect(duration)}
                className={`glass-effect rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105 button-glow ${
                  selectedPreset === duration.toString()
                    ? 'ring-2 ring-primary bg-primary/10 scale-105'
                    : 'hover:bg-card/50'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-2xl font-bold text-accent mb-1">
                  {duration}
                </div>
                <div className="text-sm text-muted">minutes</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full">
        <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
          Or Enter Custom Duration
        </h3>
        <div className="flex items-center space-x-4 justify-center">
          <input
            type="number"
            value={customDuration}
            onChange={(e) => setCustomDuration(e.target.value)}
            className="w-24 bg-secondary border border-border rounded-lg px-4 py-3 text-foreground text-center text-xl font-mono focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            placeholder="60"
            min="1"
            max="480"
          />
          <span className="text-muted font-medium">minutes</span>
          <button
            onClick={handleCustomSubmit}
            disabled={!customDuration || parseInt(customDuration) <= 0}
            className="bg-primary hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 button-glow"
          >
            Set
          </button>
        </div>
        <div className="text-center mt-2">
          <p className="text-xs text-muted">Maximum: 480 minutes (8 hours)</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="bg-secondary hover:bg-border text-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Back to Methods
        </button>
      </div>
    </div>
  )
}

export default DurationSelector