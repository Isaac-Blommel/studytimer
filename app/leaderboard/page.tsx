'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../components/Navigation'
import MedalIcon from '../../components/MedalIcon'
import FocusBackground from '../../components/FocusBackground'

interface LeaderboardUser {
  id: string
  name: string
  avatar: string
  studyTime: number
  rank: number
  sessions: number
  streak: number
}

interface SortConfig {
  key: keyof LeaderboardUser | null
  direction: 'asc' | 'desc'
}

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('weekly')
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'rank', direction: 'asc' })

  useEffect(() => {
    const mockUsers: LeaderboardUser[] = [
      {
        id: '1',
        name: 'Sarah Chen',
        avatar: 'SC',
        studyTime: 2450,
        rank: 1,
        sessions: 42,
        streak: 12
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        avatar: 'MR',
        studyTime: 2180,
        rank: 2,
        sessions: 38,
        streak: 8
      },
      {
        id: '3',
        name: 'You',
        avatar: 'YO',
        studyTime: 1920,
        rank: 3,
        sessions: 35,
        streak: 15
      },
      {
        id: '4',
        name: 'Emma Johnson',
        avatar: 'EJ',
        studyTime: 1750,
        rank: 4,
        sessions: 32,
        streak: 5
      },
      {
        id: '5',
        name: 'David Kim',
        avatar: 'DK',
        studyTime: 1650,
        rank: 5,
        sessions: 29,
        streak: 9
      },
      {
        id: '6',
        name: 'Lisa Wang',
        avatar: 'LW',
        studyTime: 1580,
        rank: 6,
        sessions: 28,
        streak: 6
      },
      {
        id: '7',
        name: 'Alex Thompson',
        avatar: 'AT',
        studyTime: 1420,
        rank: 7,
        sessions: 25,
        streak: 3
      },
      {
        id: '8',
        name: 'Maya Patel',
        avatar: 'MP',
        studyTime: 1350,
        rank: 8,
        sessions: 23,
        streak: 7
      }
    ]
    setUsers(mockUsers)
  }, [])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  const handleSort = (key: keyof LeaderboardUser) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })

    const sortedUsers = [...users].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
      return 0
    })
    setUsers(sortedUsers)
  }

  const getSortIcon = (columnKey: keyof LeaderboardUser) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-muted" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 12l5-5 5 5H5z" />
        </svg>
      )
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 12l5-5 5 5H5z" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
        <path d="M15 8l-5 5-5-5h10z" />
      </svg>
    )
  }

  const tabs = [
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'lifetime', label: 'All Time' }
  ]

  const topThree = users.slice(0, 3)

  return (
    <div className="min-h-screen gradient-bg">
      <FocusBackground />
      <Navigation />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">Leaderboard</h1>
            <p className="text-xl text-muted">Compete with fellow studiers worldwide</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex bg-secondary rounded-lg p-1 animate-slide-in">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-2 rounded-md transition-all duration-300 transform hover:scale-105 button-glow ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-lg scale-105'
                      : 'text-muted hover:text-foreground hover:bg-border'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Podium Layout */}
          <div className="glass-effect rounded-xl p-6 mb-8 animate-slide-in">
            <h2 className="text-xl font-semibold text-center text-foreground mb-6">Top Performers</h2>
            
            {/* Podium Container */}
            <div className="flex items-end justify-center space-x-6 mb-6">
              {/* 2nd Place - Left */}
              {topThree[1] && (
                <div className="flex flex-col items-center transform transition-all duration-300 hover:scale-105" style={{animationDelay: '0.2s'}}>
                  <div className="mb-6">
                    <MedalIcon rank={2} size="large" className="w-20 h-20" />
                  </div>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-semibold text-base mx-auto mb-3 shadow-lg">
                      {topThree[1].avatar}
                    </div>
                    <h3 className="font-semibold text-foreground text-base mb-1">{topThree[1].name}</h3>
                    <div className="bg-slate-50 rounded-lg px-3 py-2 mb-2">
                      <p className="text-xl font-bold text-slate-700">{formatTime(topThree[1].studyTime)}</p>
                      <p className="text-xs text-slate-600">{topThree[1].sessions} sessions</p>
                    </div>
                  </div>
                  {/* Silver Podium */}
                  <div className="w-18 h-16 bg-gradient-to-t from-slate-400 to-slate-300 rounded-lg shadow-lg flex items-center justify-center border-2 border-slate-300">
                    <div className="text-center">
                      <div className="text-white font-bold text-sm">2nd</div>
                      <div className="text-slate-100 text-xs">PLACE</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 1st Place - Center (Larger) */}
              {topThree[0] && (
                <div className="flex flex-col items-center transform transition-all duration-300 hover:scale-105" style={{animationDelay: '0.1s'}}>
                  <div className="mb-6">
                    <MedalIcon rank={1} size="large" className="w-24 h-24" />
                  </div>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-lg mx-auto mb-3 shadow-lg">
                      {topThree[0].avatar}
                    </div>
                    <h3 className="font-semibold text-foreground text-lg mb-1">{topThree[0].name}</h3>
                    <div className="bg-amber-50 rounded-lg px-4 py-2 mb-2">
                      <p className="text-2xl font-bold text-amber-700">
                        {formatTime(topThree[0].studyTime)}
                      </p>
                      <p className="text-sm text-amber-600">{topThree[0].sessions} sessions</p>
                    </div>
                  </div>
                  {/* Professional Podium */}
                  <div className="w-20 h-20 bg-gradient-to-t from-amber-600 to-amber-400 rounded-lg shadow-lg flex items-center justify-center border-2 border-amber-300">
                    <div className="text-center">
                      <div className="text-white font-bold text-lg">1st</div>
                      <div className="text-amber-100 text-xs">PLACE</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3rd Place - Right */}
              {topThree[2] && (
                <div className="flex flex-col items-center transform transition-all duration-300 hover:scale-105" style={{animationDelay: '0.3s'}}>
                  <div className="mb-6">
                    <MedalIcon rank={3} size="large" className="w-20 h-20" />
                  </div>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-base mx-auto mb-3 shadow-lg">
                      {topThree[2].avatar}
                    </div>
                    <h3 className="font-semibold text-foreground text-base mb-1">{topThree[2].name}</h3>
                    <div className="bg-orange-50 rounded-lg px-3 py-2 mb-2">
                      <p className="text-xl font-bold text-orange-700">{formatTime(topThree[2].studyTime)}</p>
                      <p className="text-xs text-orange-600">{topThree[2].sessions} sessions</p>
                    </div>
                  </div>
                  {/* Bronze Podium */}
                  <div className="w-18 h-14 bg-gradient-to-t from-orange-600 to-orange-400 rounded-lg shadow-lg flex items-center justify-center border-2 border-orange-300">
                    <div className="text-center">
                      <div className="text-white font-bold text-sm">3rd</div>
                      <div className="text-orange-100 text-xs">PLACE</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Rankings Table */}
          <div className="glass-effect rounded-xl p-8 animate-slide-in">
            <h3 className="text-xl font-bold text-foreground mb-6 text-center">Complete Rankings</h3>
            
            <div className="space-y-3">
              {/* Sortable Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-muted border-b border-border">
                <button
                  onClick={() => handleSort('rank')}
                  className="col-span-1 flex items-center space-x-1 hover:text-primary transition-colors text-left"
                >
                  <span>Rank</span>
                  {getSortIcon('rank')}
                </button>
                <div className="col-span-4">User</div>
                <button
                  onClick={() => handleSort('studyTime')}
                  className="col-span-3 flex items-center space-x-1 hover:text-primary transition-colors text-left"
                >
                  <span>Study Time</span>
                  {getSortIcon('studyTime')}
                </button>
                <button
                  onClick={() => handleSort('sessions')}
                  className="col-span-2 flex items-center space-x-1 hover:text-primary transition-colors text-left"
                >
                  <span>Sessions</span>
                  {getSortIcon('sessions')}
                </button>
                <button
                  onClick={() => handleSort('streak')}
                  className="col-span-2 flex items-center space-x-1 hover:text-primary transition-colors text-left"
                >
                  <span>Streak</span>
                  {getSortIcon('streak')}
                </button>
              </div>
              
              {/* User Rows */}
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg transition-all duration-300 hover:scale-102 transform ${
                    user.name === 'You'
                      ? 'bg-primary/10 border border-primary/30 shadow-lg animate-glow-pulse'
                      : 'bg-secondary/30 hover:bg-secondary/50'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="col-span-1">
                    <MedalIcon rank={user.rank} size="small" />
                  </div>
                  
                  <div className="col-span-4 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-border flex items-center justify-center text-foreground font-bold text-sm shadow-md">
                      {user.avatar}
                    </div>
                    <div>
                      <div className={`font-medium ${user.name === 'You' ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {user.name}
                        {user.name === 'You' && <span className="ml-2 text-xs text-primary">(You)</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <div className="font-bold text-accent">{formatTime(user.studyTime)}</div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="text-foreground font-medium">{user.sessions}</div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-warning font-bold">{user.streak}</span>
                      <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LeaderboardPage