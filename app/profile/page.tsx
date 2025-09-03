'use client'

import { useState } from 'react'
import Navigation from '../../components/Navigation'
import { useSession } from '../../contexts/SessionContext'

const ProfilePage = () => {
  const { sessions, sessionStats, streakData, loading, error } = useSession()
  const [activeTab, setActiveTab] = useState('overview')

  // Use pre-calculated stats from context
  const { totalStudyTime, totalSessions, averageSessionLength, thisWeekTime } = sessionStats

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStreakStatusMessage = () => {
    switch (streakData.streakStatus) {
      case 'active_today':
        return 'Active today!'
      case 'at_risk':
        return 'Study today to keep your streak!'
      case 'broken':
        return 'Streak broken - start a new one!'
      case 'no_streak':
        return 'Study 5+ minutes to start a streak!'
      default:
        return ''
    }
  }

  const getStreakStatusColor = () => {
    switch (streakData.streakStatus) {
      case 'active_today':
        return 'text-green-500'
      case 'at_risk':
        return 'text-yellow-500'
      case 'broken':
        return 'text-red-500'
      case 'no_streak':
        return 'text-muted'
      default:
        return 'text-muted'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Study History' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navigation />
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-xl text-muted">Loading your study data...</div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg">
        <Navigation />
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-xl text-danger mb-4">Failed to load study data</div>
            <div className="text-muted">{error}</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">Your Profile</h1>
            <p className="text-xl text-muted">Track your study progress and manage your account</p>
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

          {activeTab === 'overview' && (
            <div className="space-y-8 animate-slide-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <div className="glass-effect rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-accent mb-2">{totalStudyTime}m</div>
                  <div className="text-muted">Total Study Time</div>
                </div>
                
                <div className="glass-effect rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-primary mb-2">{totalSessions}</div>
                  <div className="text-muted">Sessions Completed</div>
                </div>
                
                <div className="glass-effect rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-warning mb-2">{averageSessionLength}m</div>
                  <div className="text-muted">Average Session</div>
                </div>
                
                <div className="glass-effect rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-accent mb-2">{thisWeekTime}m</div>
                  <div className="text-muted">This Week</div>
                </div>
                
                <div className="glass-effect rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-orange-500 mb-2">
                    {streakData.currentStreak}
                    <span className="text-sm ml-1">🔥</span>
                  </div>
                  <div className="text-muted mb-1">Current Streak</div>
                  <div className={`text-xs font-medium ${getStreakStatusColor()}`}>
                    {getStreakStatusMessage()}
                  </div>
                </div>
                
                <div className="glass-effect rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105">
                  <div className="text-3xl font-bold text-purple-500 mb-2">
                    {streakData.longestStreak}
                    <span className="text-sm ml-1">🏆</span>
                  </div>
                  <div className="text-muted">Best Streak</div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6">Recent Sessions</h3>
                <div className="space-y-4">
                  {sessions.slice(0, 3).map((session, index) => (
                    <div
                      key={session.id}
                      className="flex items-start space-x-4 p-4 bg-secondary/50 rounded-lg transform transition-all duration-300 hover:scale-102 hover:bg-secondary/70"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {session.duration}m
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-medium text-foreground">{session.method}</span>
                          <span className="text-xs text-muted">
                            {formatDate(session.timestamp)} at {formatTime(session.timestamp)}
                          </span>
                        </div>
                        <p className="text-muted text-sm line-clamp-2">{session.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 animate-slide-in">
              <div className="glass-effect rounded-xl p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Complete Study History</h3>
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <div
                      key={session.id}
                      className="border border-border rounded-lg p-6 transform transition-all duration-300 hover:scale-102 hover:border-primary/30 hover:bg-card/30"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {session.duration}m
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-foreground">{session.method}</div>
                            <div className="text-sm text-muted">
                              {formatDate(session.timestamp)} at {formatTime(session.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                        {session.studyTopic && (
                          <div>
                            <h4 className="text-sm font-medium text-muted mb-1">Study Topic</h4>
                            <p className="text-foreground">{session.studyTopic}</p>
                          </div>
                        )}
                        {session.notes && (
                          <div>
                            <h4 className="text-sm font-medium text-muted mb-1">Notes</h4>
                            <p className="text-foreground">{session.notes}</p>
                          </div>
                        )}
                        {!session.studyTopic && !session.notes && (
                          <p className="text-muted text-center italic">No notes recorded</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default ProfilePage