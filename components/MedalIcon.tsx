'use client'

interface MedalIconProps {
  rank: number
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const MedalIcon = ({ rank, size = 'medium', className = '' }: MedalIconProps) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  }

  const getMedalSVG = () => {
    switch (rank) {
      case 1:
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#FFA500" />
                <stop offset="100%" stopColor="#FF8C00" />
              </linearGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
              </filter>
            </defs>
            {/* Medal ribbon */}
            <path d="M35 15 L65 15 L60 35 L40 35 Z" fill="#C41E3A" />
            <path d="M30 15 L40 15 L35 35 L25 35 Z" fill="#8B0000" />
            <path d="M60 15 L70 15 L75 35 L65 35 Z" fill="#8B0000" />
            {/* Medal circle */}
            <circle cx="50" cy="55" r="25" fill="url(#gold)" filter="url(#shadow)" stroke="#B8860B" strokeWidth="2" />
            {/* Crown symbol */}
            <path d="M42 48 L50 45 L58 48 L56 55 L44 55 Z" fill="#B8860B" />
            <circle cx="42" cy="48" r="2" fill="#B8860B" />
            <circle cx="50" cy="45" r="2" fill="#B8860B" />
            <circle cx="58" cy="48" r="2" fill="#B8860B" />
            {/* Number 1 */}
            <text x="50" y="68" textAnchor="middle" fill="#B8860B" fontSize="14" fontWeight="bold">1</text>
          </svg>
        )
      case 2:
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E5E5E5" />
                <stop offset="50%" stopColor="#C0C0C0" />
                <stop offset="100%" stopColor="#A8A8A8" />
              </linearGradient>
              <filter id="shadowSilver" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.2"/>
              </filter>
            </defs>
            {/* Medal ribbon */}
            <path d="M35 15 L65 15 L60 35 L40 35 Z" fill="#4169E1" />
            <path d="M30 15 L40 15 L35 35 L25 35 Z" fill="#191970" />
            <path d="M60 15 L70 15 L75 35 L65 35 Z" fill="#191970" />
            {/* Medal circle */}
            <circle cx="50" cy="55" r="25" fill="url(#silver)" filter="url(#shadowSilver)" stroke="#A0A0A0" strokeWidth="2" />
            {/* Star symbol */}
            <path d="M50 45 L52 52 L59 52 L54 57 L56 64 L50 60 L44 64 L46 57 L41 52 L48 52 Z" fill="#A0A0A0" />
            {/* Number 2 */}
            <text x="50" y="68" textAnchor="middle" fill="#A0A0A0" fontSize="14" fontWeight="bold">2</text>
          </svg>
        )
      case 3:
        return (
          <svg viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
            <defs>
              <linearGradient id="bronze" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#CD7F32" />
                <stop offset="50%" stopColor="#B87333" />
                <stop offset="100%" stopColor="#A0522D" />
              </linearGradient>
              <filter id="shadowBronze" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="1" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.2"/>
              </filter>
            </defs>
            {/* Medal ribbon */}
            <path d="M35 15 L65 15 L60 35 L40 35 Z" fill="#228B22" />
            <path d="M30 15 L40 15 L35 35 L25 35 Z" fill="#006400" />
            <path d="M60 15 L70 15 L75 35 L65 35 Z" fill="#006400" />
            {/* Medal circle */}
            <circle cx="50" cy="55" r="25" fill="url(#bronze)" filter="url(#shadowBronze)" stroke="#8B4513" strokeWidth="2" />
            {/* Shield symbol */}
            <path d="M50 45 L57 48 L57 60 L50 65 L43 60 L43 48 Z" fill="#8B4513" />
            <path d="M47 50 L50 47 L53 50 L53 58 L50 61 L47 58 Z" fill="#CD7F32" />
            {/* Number 3 */}
            <text x="50" y="68" textAnchor="middle" fill="#8B4513" fontSize="14" fontWeight="bold">3</text>
          </svg>
        )
      default:
        return (
          <div className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br from-secondary to-border flex items-center justify-center text-muted font-bold text-sm`}>
            {rank}
          </div>
        )
    }
  }

  return getMedalSVG()
}

export default MedalIcon