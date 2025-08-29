'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Navigation = () => {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Timer' },
    { href: '/profile', label: 'Profile' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect animate-slide-in">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-3 items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-sm animate-pulse-gentle">
              ST
            </div>
            <h1 className="text-xl font-bold text-foreground">StudyTimer</h1>
          </div>
          
          <div className="flex justify-center">
            <div className="flex items-center space-x-1 bg-secondary rounded-lg p-1">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-6 py-2 rounded-md transition-all duration-300 transform hover:scale-105 button-glow ${
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
            <button className="text-muted hover:text-foreground transition-all duration-200 hover:scale-110">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation