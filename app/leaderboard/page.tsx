'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Navigation from '../../components/Navigation'
import MedalIcon from '../../components/MedalIcon'
import FocusBackground from '../../components/FocusBackground'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface LeaderboardUser {
  id: string
  name: string
  avatar_url?: string
  total_study_time: number
  rank: number
  total_sessions: number
  current_streak: number
}

interface SortConfig {
  key: keyof LeaderboardUser | null
  direction: 'asc' | 'desc'
}

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('lifetime')
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'total_study_time', direction: 'desc' })
  const { user: currentUser } = useAuth()

  const fetchLeaderboard = async (period: string = 'lifetime') => {
    setLoading(true)
    try {
      let query
      
      if (period === 'lifetime') {
        query = supabase
          .from('leaderboard')
          .select('*')
          .order('total_study_time', { ascending: false })
          .limit(50)
      } else if (period === 'weekly') {
        query = supabase
          .from('weekly_leaderboard')
          .select('*')
          .order('weekly_study_time', { ascending: false })
          .limit(50)
      } else if (period === 'monthly') {
        query = supabase
          .from('monthly_leaderboard')
          .select('*')
          .order('monthly_study_time', { ascending: false })
          .limit(50)
      }

      const { data, error } = await query!

      if (error) {
        console.error('Error fetching leaderboard:', error)
        setUsers([])
      } else {
        // Map the data to the expected format and add ranks
        const mappedUsers: LeaderboardUser[] = (data || []).map((user, index) => ({
          id: user.id,
          name: user.name,
          avatar_url: user.avatar_url,
          total_study_time: period === 'weekly' ? user.weekly_study_time : 
                           period === 'monthly' ? user.monthly_study_time : 
                           user.total_study_time,
          total_sessions: period === 'weekly' ? user.weekly_sessions :
                         period === 'monthly' ? user.monthly_sessions :
                         user.total_sessions || 0,
          current_streak: user.current_streak || 0,
          rank: index + 1
        }))
        setUsers(mappedUsers)
      }
    } catch (error) {
      console.error('Unexpected error fetching leaderboard:', error)
      setUsers([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeaderboard(activeTab)
  }, [activeTab])

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
      const aValue = a[key]
      const bValue = b[key]
      if (aValue !== undefined && bValue !== undefined) {
        if (aValue < bValue) return direction === 'asc' ? -1 : 1
        if (aValue > bValue) return direction === 'asc' ? 1 : -1
      }
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
    { id: 'lifetime', label: 'All Time' },
    { id: 'monthly', label: 'This Month' },
    { id: 'weekly', label: 'This Week' }
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

          {/* Elite Podium with Pillars */}
          {topThree.length > 0 && (
            <div className="glass-effect rounded-xl p-8 mb-8 animate-slide-in relative overflow-hidden">
              {/* Enhanced Star Pattern Background */}
              <div className="absolute inset-0 star-pattern-bg pointer-events-none"></div>
              <div className="absolute inset-0 spotlight-bg pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/3 to-transparent pointer-events-none"></div>
              
              <h2 className="text-2xl font-bold text-center text-foreground mb-12 relative z-10">Top Performers</h2>
              
              <div className="flex items-end justify-center space-x-12 max-w-5xl mx-auto relative z-10">
                {/* 2nd Place Pillar */}
                {topThree[1] && (
                  <div className="flex flex-col items-center" style={{animationDelay: '0.2s'}}>
                    {/* User Info Above Pillar */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative mb-3 avatar-shimmer-silver">
                        {topThree[1].avatar_url ? (
                          <Image
                            src={topThree[1].avatar_url}
                            alt={topThree[1].name}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full border-4 border-slate-300 shadow-xl relative z-10"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center text-white font-bold text-lg shadow-xl border-4 border-slate-300 relative z-10 ${topThree[1].avatar_url ? 'hidden' : ''}`}>
                          {topThree[1].name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <h3 className="font-bold text-foreground text-lg mb-1 text-center">{topThree[1].name}</h3>
                    </div>
                    
                    {/* Silver Pillar */}
                    <div className="relative">
                      <div className="w-32 h-36 bg-gradient-to-t from-slate-600 via-slate-400 to-slate-300 rounded-t-2xl border-4 border-slate-400 shadow-2xl glow-silver relative overflow-hidden">
                        {/* Pillar Decorations */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10"></div>
                        <div className="absolute top-2 left-2 w-2 h-2 bg-white/40 rounded-full"></div>
                        <div className="absolute top-4 right-3 w-1 h-1 bg-white/30 rounded-full"></div>
                        
                        {/* 2nd Place Badge */}
                        <div className="absolute top-5 left-1/2 transform -translate-x-1/2">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center border-3 border-slate-400 shadow-lg">
                            <span className="text-slate-700 font-bold text-base">2nd</span>
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="absolute bottom-4 inset-x-2 text-center">
                          <div className="text-white font-bold text-lg mb-1 drop-shadow-lg">{formatTime(topThree[1].total_study_time)}</div>
                          <div className="text-slate-100 text-xs font-medium drop-shadow">{topThree[1].total_sessions} sessions</div>
                        </div>
                      </div>
                      
                      {/* Pillar Base */}
                      <div className="w-32 h-4 bg-gradient-to-r from-slate-700 via-slate-500 to-slate-700 rounded-b-lg border-x-4 border-b-4 border-slate-400"></div>
                    </div>
                  </div>
                )}

                {/* 1st Place Pillar - Tallest */}
                {topThree[0] && (
                  <div className="flex flex-col items-center" style={{animationDelay: '0.1s'}}>
                    {/* User Info Above Pillar */}
                    <div className="flex flex-col items-center mb-8">
                      <div className="relative mb-4 avatar-shimmer-gold">
                        {topThree[0].avatar_url ? (
                          <Image
                            src={topThree[0].avatar_url}
                            alt={topThree[0].name}
                            width={80}
                            height={80}
                            className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-2xl relative z-10"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-white font-bold text-xl shadow-2xl border-4 border-yellow-400 relative z-10 ${topThree[0].avatar_url ? 'hidden' : ''}`}>
                          {topThree[0].name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <h3 className="font-bold text-foreground text-xl mb-2 text-center">{topThree[0].name}</h3>
                    </div>
                    
                    {/* Gold Pillar - Tallest */}
                    <div className="relative">
                      <div className="w-36 h-44 bg-gradient-to-t from-yellow-700 via-yellow-500 to-yellow-300 rounded-t-2xl border-4 border-yellow-400 shadow-2xl glow-gold relative overflow-hidden">
                        {/* Pillar Decorations */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 via-transparent to-yellow-800/20"></div>
                        <div className="absolute top-3 left-3 w-3 h-3 bg-yellow-100/60 rounded-full"></div>
                        <div className="absolute top-6 right-4 w-2 h-2 bg-yellow-100/40 rounded-full"></div>
                        <div className="absolute bottom-8 left-4 w-1 h-1 bg-yellow-100/50 rounded-full"></div>
                        
                        {/* 1st Place Badge */}
                        <div className="absolute top-7 left-1/2 transform -translate-x-1/2">
                          <div className="bg-yellow-100 backdrop-blur-sm rounded-full w-14 h-14 flex items-center justify-center border-4 border-yellow-400 shadow-xl">
                            <span className="text-yellow-800 font-bold text-lg">1st</span>
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="absolute bottom-6 inset-x-3 text-center">
                          <div className="text-white font-bold text-xl mb-2 drop-shadow-lg">{formatTime(topThree[0].total_study_time)}</div>
                          <div className="text-yellow-100 text-sm font-medium drop-shadow">{topThree[0].total_sessions} sessions</div>
                        </div>
                      </div>
                      
                      {/* Pillar Base */}
                      <div className="w-36 h-5 bg-gradient-to-r from-yellow-800 via-yellow-600 to-yellow-800 rounded-b-xl border-x-4 border-b-4 border-yellow-400"></div>
                    </div>
                  </div>
                )}

                {/* 3rd Place Pillar */}
                {topThree[2] && (
                  <div className="flex flex-col items-center" style={{animationDelay: '0.3s'}}>
                    {/* User Info Above Pillar */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative mb-3 avatar-shimmer-bronze">
                        {topThree[2].avatar_url ? (
                          <Image
                            src={topThree[2].avatar_url}
                            alt={topThree[2].name}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full border-4 border-orange-400 shadow-xl relative z-10"
                            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center text-white font-bold text-lg shadow-xl border-4 border-orange-400 relative z-10 ${topThree[2].avatar_url ? 'hidden' : ''}`}>
                          {topThree[2].name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <h3 className="font-bold text-foreground text-lg mb-1 text-center">{topThree[2].name}</h3>
                    </div>
                    
                    {/* Bronze Pillar - Shortest */}
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-t from-orange-800 via-orange-600 to-orange-400 rounded-t-2xl border-4 border-orange-500 shadow-2xl glow-bronze relative overflow-hidden">
                        {/* Pillar Decorations */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 via-transparent to-orange-900/15"></div>
                        <div className="absolute top-2 left-2 w-2 h-2 bg-orange-200/40 rounded-full"></div>
                        <div className="absolute top-3 right-3 w-1 h-1 bg-orange-100/30 rounded-full"></div>
                        
                        {/* 3rd Place Badge */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                          <div className="bg-orange-100/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center border-3 border-orange-500 shadow-lg">
                            <span className="text-orange-800 font-bold text-sm">3rd</span>
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="absolute bottom-3 inset-x-2 text-center">
                          <div className="text-white font-bold text-base mb-1 drop-shadow-lg">{formatTime(topThree[2].total_study_time)}</div>
                          <div className="text-orange-100 text-xs font-medium drop-shadow">{topThree[2].total_sessions} sessions</div>
                        </div>
                      </div>
                      
                      {/* Pillar Base */}
                      <div className="w-32 h-4 bg-gradient-to-r from-orange-900 via-orange-700 to-orange-900 rounded-b-lg border-x-4 border-b-4 border-orange-500"></div>
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="glass-effect rounded-xl p-8 mb-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted">Loading leaderboard...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && users.length === 0 && (
            <div className="glass-effect rounded-xl p-8 mb-8 text-center">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Data Yet</h3>
              <p className="text-muted">Be the first to start studying and climb the leaderboard!</p>
            </div>
          )}

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
                  onClick={() => handleSort('total_study_time')}
                  className="col-span-3 flex items-center space-x-1 hover:text-primary transition-colors text-left"
                >
                  <span>Study Time</span>
                  {getSortIcon('total_study_time')}
                </button>
                <button
                  onClick={() => handleSort('total_sessions')}
                  className="col-span-2 flex items-center space-x-1 hover:text-primary transition-colors text-left"
                >
                  <span>Sessions</span>
                  {getSortIcon('total_sessions')}
                </button>
                <button
                  onClick={() => handleSort('current_streak')}
                  className="col-span-2 flex items-center space-x-1 hover:text-primary transition-colors text-left"
                >
                  <span>Streak</span>
                  {getSortIcon('current_streak')}
                </button>
              </div>
              
              {/* User Rows */}
              {!loading && users.map((user, index) => (
                <div
                  key={user.id}
                  className={`grid grid-cols-12 gap-4 items-center p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] transform ${
                    currentUser && user.id === currentUser.id
                      ? 'bg-primary/10 border border-primary/30 shadow-lg ring-2 ring-primary/20'
                      : 'bg-secondary/30 hover:bg-secondary/50'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="col-span-1">
                    <MedalIcon rank={user.rank} size="small" />
                  </div>
                  
                  <div className="col-span-4 flex items-center space-x-3">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full border-2 border-border shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-foreground font-bold text-sm shadow-md border-2 border-border ${user.avatar_url ? 'hidden' : ''}`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={`font-medium ${
                        currentUser && user.id === currentUser.id ? 'text-primary font-bold' : 'text-foreground'
                      }`}>
                        {user.name}
                        {currentUser && user.id === currentUser.id && (
                          <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">(You)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <div className="font-bold text-accent">{formatTime(user.total_study_time)}</div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="text-foreground font-medium">{user.total_sessions}</div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-warning font-bold">{user.current_streak}</span>
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