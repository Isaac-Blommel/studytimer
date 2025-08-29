'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import { useTimer } from '../contexts/TimerContext'

const Navigation = () => {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { timerState } = useTimer()

  // Don't show navigation on login page or if not authenticated
  if (pathname === '/login' || !user) {
    return null
  }

  const navItems = [
    { href: '/', label: 'Timer' },
    { href: '/profile', label: 'Profile' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect animate-slide-in">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-3 items-center">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold text-foreground">StudyTimer</h1>
          </Link>
          
          <div className="flex justify-center">
            <div className="flex items-center space-x-1 bg-secondary rounded-lg p-1">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-8 py-2 rounded-md transition-all duration-300 transform hover:scale-105 button-glow ${
                    pathname === item.href
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'text-muted hover:text-foreground hover:bg-border'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end items-center space-x-3">
            {/* Timer Status Indicator */}
            {timerState.isActive && (
              <Link
                href="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  timerState.isPaused 
                    ? 'bg-warning/20 text-warning hover:bg-warning/30'
                    : 'bg-primary/20 text-primary hover:bg-primary/30 animate-pulse-gentle'
                }`}
                title="Click to return to timer"
              >
                <div className={`w-2 h-2 rounded-full ${
                  timerState.isPaused ? 'bg-warning' : 'bg-primary animate-ping'
                }`} />
                <span className="text-sm font-medium">
                  {Math.floor(Math.max(0, timerState.timeLeft) / 60)}:{(Math.max(0, timerState.timeLeft) % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-xs">
                  {timerState.isPaused ? 'Paused' : 'Active'}
                </span>
              </Link>
            )}
            <Link
              href="/settings"
              className={`px-6 py-2 rounded-md transition-all duration-300 transform hover:scale-105 button-glow ${
                pathname === '/settings'
                  ? 'bg-primary text-white shadow-lg scale-105'
                  : 'text-muted hover:text-foreground hover:bg-border'
              }`}
            >
              <span className="font-medium">Settings</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={signOut}
                className="text-muted hover:text-danger transition-all duration-200 hover:scale-110 px-2 py-1 rounded"
                title="Sign Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation