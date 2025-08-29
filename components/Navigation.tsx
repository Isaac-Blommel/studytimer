'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

const Navigation = () => {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

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
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-sm animate-pulse-gentle">
              ST
            </div>
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
              {user?.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-primary"
                />
              )}
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