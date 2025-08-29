'use client'

import { useState, useEffect } from 'react'
import Navigation from '../../components/Navigation'

interface LeaderboardUser {
  id: string
  name: string
  avatar: string
  studyTime: number
  rank: number
  sessions: number
  streak: number
}

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('weekly')
  const [users, setUsers] = useState<LeaderboardUser[]>([])

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

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600'
      case 2:
        return 'from-gray-300 to-gray-500'
      case 3:
        return 'from-amber-600 to-amber-800'
      default:
        return 'from-primary to-accent'
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return (
        <div className="flex items-center justify-center">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center text-white font-bold text-sm`}>
            {rank}
          </div>
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center">
        <span className="text-lg font-bold text-muted">{rank}</span>
      </div>
    )
  }

  const tabs = [
    { id: 'weekly', label: 'This Week' },
    { id: 'monthly', label: 'This Month' },
    { id: 'lifetime', label: 'All Time' }
  ]

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">Leaderboard</h1>
            <p className="text-xl text-muted">See how you stack up against other studiers</p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="flex bg-secondary rounded-lg p-1 animate-slide-in">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-md transition-all duration-300 transform hover:scale-105 ${
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

          <div className="glass-effect rounded-xl p-8 animate-slide-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {users.slice(0, 3).map((user, index) => (
                <div
                  key={user.id}
                  className={`text-center p-6 rounded-xl transform transition-all duration-300 hover:scale-105 ${
                    user.name === 'You' ? 'bg-primary/20 ring-2 ring-primary' : 'bg-secondary/50'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative mb-4">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getRankColor(user.rank)} flex items-center justify-center text-white font-bold text-xl mx-auto`}>
                      {user.avatar}
                    </div>
                    <div className="absolute -top-2 -right-2">
                      {getRankIcon(user.rank)}
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{user.name}</h3>
                  <p className="text-2xl font-bold text-accent mb-1">{formatTime(user.studyTime)}</p>
                  <p className="text-sm text-muted">{user.sessions} sessions</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted border-b border-border">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">User</div>
                <div className="col-span-3">Study Time</div>
                <div className="col-span-2">Sessions</div>
                <div className="col-span-2">Streak</div>
              </div>
              
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg transition-all duration-300 hover:scale-102 transform ${
                    user.name === 'You'
                      ? 'bg-primary/10 border border-primary/30 shadow-lg'
                      : 'bg-secondary/30 hover:bg-secondary/50'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="col-span-1">
                    {getRankIcon(user.rank)}
                  </div>
                  
                  <div className="col-span-4 flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(user.rank)} flex items-center justify-center text-white font-bold text-sm`}>
                      {user.avatar}
                    </div>
                    <div>
                      <div className={`font-medium ${user.name === 'You' ? 'text-primary' : 'text-foreground'}`}>
                        {user.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <div className="font-bold text-accent">{formatTime(user.studyTime)}</div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="text-foreground">{user.sessions}</div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-warning">{user.streak}</span>
                      <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center animate-slide-in">
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">Your Progress</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">#3</div>
                  <div className="text-sm text-muted">Current Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">32h 0m</div>
                  <div className="text-sm text-muted">Study Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning mb-1">15 days</div>
                  <div className="text-sm text-muted">Current Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LeaderboardPage