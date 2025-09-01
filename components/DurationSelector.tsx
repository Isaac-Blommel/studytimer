'use client'

import { useState } from 'react'

interface DurationSelectorProps {
  method: string
  onDurationSelect: (duration: number, breakDuration?: number, cycles?: number) => void
  onBack: () => void
}

interface MethodVariation {
  work: number
  break: number
  label: string
  popular?: boolean
}

const DurationSelector = ({ method, onDurationSelect, onBack }: DurationSelectorProps) => {
  const [selectedVariation, setSelectedVariation] = useState<MethodVariation | null>(null)
  const [cycles, setCycles] = useState(1)

  const getMethodVariations = (): MethodVariation[] => {
    switch (method) {
      case 'pomodoro':
        return [
          { work: 20, break: 5, label: '20/5' },
          { work: 25, break: 5, label: '25/5', popular: true },
          { work: 30, break: 5, label: '30/5' },
          { work: 45, break: 10, label: '45/10' }
        ]
      case 'fifty-ten':
        return [
          { work: 40, break: 10, label: '40/10' },
          { work: 50, break: 10, label: '50/10', popular: true },
          { work: 55, break: 5, label: '55/5' },
          { work: 60, break: 10, label: '60/10' }
        ]
      case 'ninety-fifteen':
        return [
          { work: 75, break: 15, label: '75/15' },
          { work: 90, break: 15, label: '90/15', popular: true },
          { work: 90, break: 20, label: '90/20' },
          { work: 100, break: 20, label: '100/20' }
        ]
      case 'two-hour':
        return [
          { work: 100, break: 20, label: '100/20' },
          { work: 120, break: 20, label: '120/20' },
          { work: 120, break: 30, label: '120/30', popular: true },
          { work: 150, break: 30, label: '150/30' }
        ]
      default:
        return []
    }
  }

  const variations = getMethodVariations()

  const handleVariationSelect = (variation: MethodVariation) => {
    setSelectedVariation(variation)
  }
  
  const handleStartStudying = () => {
    if (selectedVariation) {
      // Pass work duration, break duration, and cycles
      onDurationSelect(selectedVariation.work, selectedVariation.break, cycles)
    }
  }

  const formatMethodName = (methodId: string) => {
    const names: { [key: string]: string } = {
      'pomodoro': 'Pomodoro Technique',
      'fifty-ten': '50/10 Method',
      'ninety-fifteen': '90/15 Method',
      'two-hour': '2-Hour Deep Work',
      'custom': 'Custom Timer'
    }
    return names[methodId] || methodId
  }

  return (
    <div className="flex flex-col items-center space-y-8 animate-slide-in w-full max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          {formatMethodName(method)}
        </h2>
        <p className="text-muted">Choose your timing variation</p>
      </div>

      <div className="w-full">
        <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
          Select Time Split
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variations.map((variation, index) => (
            <button
              key={variation.label}
              onClick={() => handleVariationSelect(variation)}
              className={`glass-effect rounded-xl p-6 text-center transition-all duration-300 transform hover:scale-105 button-glow relative ${
                selectedVariation?.label === variation.label
                  ? 'ring-2 ring-primary bg-primary/10 scale-105'
                  : 'hover:bg-card/50'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {variation.popular && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                  POPULAR
                </div>
              )}
              
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-accent">{variation.work}</div>
                  <div className="text-xs text-muted">min work</div>
                </div>
                <div className="text-muted text-lg">/</div>
                <div className="text-center">
                  <div className="text-xl font-bold text-warning">{variation.break}</div>
                  <div className="text-xs text-muted">min break</div>
                </div>
              </div>
              
            </button>
          ))}
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
        {selectedVariation && (
          <div className="text-center mt-4 text-sm text-muted">
            Total time: ~{(selectedVariation.work + selectedVariation.break) * cycles} minutes
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onBack}
          className="bg-secondary hover:bg-border text-foreground font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Back to Methods
        </button>
        <button
          onClick={handleStartStudying}
          disabled={!selectedVariation}
          className="bg-primary hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 button-glow"
        >
          Start Studying
        </button>
      </div>
    </div>
  )
}

export default DurationSelector