'use client'

interface AchievementBadgeProps {
  type: 'streak' | 'time' | 'sessions' | 'milestone'
  value: number
  isUnlocked: boolean
  className?: string
}

const AchievementBadge = ({ type, value, isUnlocked, className = '' }: AchievementBadgeProps) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'streak':
        return {
          icon: '🔥',
          title: `${value} Day Streak`,
          description: `Studied for ${value} consecutive days`,
          color: 'from-orange-400 to-red-500',
          shadowColor: 'shadow-orange-500/20'
        }
      case 'time':
        return {
          icon: '⏰',
          title: `${value} Hour Club`,
          description: `Completed ${value} hours of focused study`,
          color: 'from-blue-400 to-blue-600',
          shadowColor: 'shadow-blue-500/20'
        }
      case 'sessions':
        return {
          icon: '📚',
          title: `${value} Sessions`,
          description: `Completed ${value} study sessions`,
          color: 'from-green-400 to-green-600',
          shadowColor: 'shadow-green-500/20'
        }
      case 'milestone':
        return {
          icon: '🏆',
          title: `Milestone ${value}`,
          description: `Achieved major study milestone`,
          color: 'from-yellow-400 to-yellow-600',
          shadowColor: 'shadow-yellow-500/20'
        }
      default:
        return {
          icon: '⭐',
          title: 'Achievement',
          description: 'Special accomplishment',
          color: 'from-purple-400 to-purple-600',
          shadowColor: 'shadow-purple-500/20'
        }
    }
  }

  const config = getBadgeConfig()

  return (
    <div className={`relative group ${className}`}>
      <div 
        className={`
          w-16 h-16 rounded-full flex items-center justify-center text-2xl
          transition-all duration-300 transform hover:scale-110
          ${isUnlocked 
            ? `bg-gradient-to-br ${config.color} shadow-lg ${config.shadowColor} animate-pulse-gentle` 
            : 'bg-gray-600 opacity-50'
          }
        `}
      >
        <span className={isUnlocked ? 'animate-bounce' : ''}>{config.icon}</span>
      </div>
      
      {/* Glow effect for unlocked badges */}
      {isUnlocked && (
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.color} opacity-20 blur-lg animate-ping`}
          style={{ animationDuration: '2s' }}
        />
      )}
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/80 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        <div className="font-semibold">{config.title}</div>
        <div className="text-gray-300 text-xs">{config.description}</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/80"></div>
      </div>
      
      {/* Sparkle animation for newly unlocked */}
      {isUnlocked && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-1 -right-1 text-yellow-400 text-xs animate-ping">✨</div>
          <div className="absolute -bottom-1 -left-1 text-yellow-400 text-xs animate-ping" style={{animationDelay: '0.5s'}}>✨</div>
          <div className="absolute -top-1 -left-1 text-yellow-400 text-xs animate-ping" style={{animationDelay: '1s'}}>✨</div>
        </div>
      )}
    </div>
  )
}

export default AchievementBadge