'use client'


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
    name: 'Pomodoro Technique',
    duration: 25,
    breakDuration: 5,
    description: 'Short focused bursts with quick breaks to prevent burnout and maintain high productivity'
  },
  {
    id: 'fifty-ten',
    name: '50/10 Method',
    duration: 50,
    breakDuration: 10,
    description: 'Extended focus sessions designed for sustained productivity without overwhelming the brain'
  },
  {
    id: 'ninety-fifteen',
    name: '90/15 Method',
    duration: 90,
    breakDuration: 15,
    description: 'Deep work based on ultradian rhythms - natural cycles of high and low alertness'
  },
  {
    id: 'two-hour',
    name: '2-Hour Deep Work',
    duration: 120,
    breakDuration: 30,
    description: 'Maximum concentration sessions for tasks requiring minimal interruptions'
  },
  {
    id: 'custom',
    name: 'Custom Timer',
    duration: 0,
    breakDuration: 0,
    description: 'Choose from preset variations or design your own schedule'
  }
]

interface TimerMethodSelectorProps {
  selectedMethod: string
  onMethodSelect: (method: TimerMethod) => void
}

const TimerMethodSelector = ({ selectedMethod, onMethodSelect }: TimerMethodSelectorProps) => {
  // Separate preset methods from custom timer
  const presetMethods = timerMethods.slice(0, 4) // First 4 methods
  const customMethod = timerMethods[4] // Custom timer method

  return (
    <div className="w-full max-w-5xl animate-slide-in space-y-8">
      {/* 2x2 Grid for preset methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {presetMethods.map((method, index) => (
          <div
            key={method.id}
            className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:bg-white/25 hover:border-white/40 shadow-lg hover:shadow-xl"
            onClick={() => onMethodSelect(method)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="mb-4">
              <h3 className="text-xl font-bold text-white">{method.name}</h3>
            </div>
            
            <p className="text-gray-200 text-base mb-6">{method.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-accent font-semibold text-base">Work Time</span>
                <span className="text-white font-mono text-lg font-bold">{method.duration} min</span>
              </div>
              <div className="w-px h-10 bg-white/40" />
              <div className="flex flex-col">
                <span className="text-warning font-semibold text-base">Break Time</span>
                <span className="text-white font-mono text-lg font-bold">{method.breakDuration} min</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Timer - wider button below */}
      <div
        className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl p-8 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:bg-white/25 hover:border-white/40 shadow-lg hover:shadow-xl w-full"
        onClick={() => onMethodSelect(customMethod)}
        style={{ animationDelay: `${4 * 0.1}s` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-3">{customMethod.name}</h3>
            <p className="text-gray-200 text-base">{customMethod.description}</p>
          </div>
          <div className="ml-8">
            <div className="text-accent font-semibold text-base">Fully Customizable</div>
            <div className="text-white font-mono text-lg font-bold">Your schedule</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimerMethodSelector