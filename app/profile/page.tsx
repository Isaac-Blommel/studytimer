'use client'

import { useState } from 'react'
import Navigation from '../../components/Navigation'
import { useSession } from '../../contexts/SessionContext'

const ProfilePage = () => {
  const { sessions, sessionStats, loading, error } = useSession()
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

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Study History' },
    { id: 'settings', label: 'Settings' }
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-slide-in">
              <div className="glass-effect rounded-xl p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Account Settings</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">Sound Notifications</div>
                      <div className="text-sm text-muted">Play sound when timer completes</div>
                    </div>
                    <button className="w-12 h-6 bg-primary rounded-full relative transition-colors">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">Auto-start Breaks</div>
                      <div className="text-sm text-muted">Automatically start break timers</div>
                    </div>
                    <button className="w-12 h-6 bg-border rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform"></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">Google Calendar Integration</div>
                      <div className="text-sm text-muted">Create calendar events for study sessions</div>
                    </div>
                    <button className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105">
                      Connect
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-8">
                <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Data Management</h3>
                <div className="space-y-4">
                  <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-left">
                    Connect Google Calendar
                  </button>
                  <button className="w-full bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30 py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-left">
                    Clear All Data
                  </button>
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