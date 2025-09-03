'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { SessionService } from '../lib/sessionService'
import { StudySession, StreakData } from '../types/services'

interface SessionContextType {
  sessions: StudySession[]
  sessionStats: {
    totalStudyTime: number
    totalSessions: number
    averageSessionLength: number
    thisWeekTime: number
    thisWeekSessions: number
  }
  streakData: StreakData
  loading: boolean
  error: string | null
  addSession: (session: Omit<StudySession, 'id' | 'timestamp'>) => Promise<void>
  refreshSessions: () => Promise<void>
  clearAllSessions: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

// Default session stats to prevent duplication
const defaultSessionStats = {
  totalStudyTime: 0,
  totalSessions: 0,
  averageSessionLength: 0,
  thisWeekTime: 0,
  thisWeekSessions: 0
}

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastStudyDate: null,
  streakStatus: 'no_streak',
  daysSinceLastStudy: 0
}

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [sessionStats, setSessionStats] = useState(defaultSessionStats)
  const [streakData, setStreakData] = useState<StreakData>(defaultStreakData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionService = SessionService.getInstance()

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load core data first (sessions and stats)
      const [loadedSessions, stats] = await Promise.all([
        sessionService.getAllSessions(),
        sessionService.getSessionStats()
      ])
      
      setSessions(loadedSessions)
      setSessionStats(stats)
      
      // Try to load streak data separately - don't fail if it doesn't work
      try {
        const streaks = await sessionService.getStreakData()
        setStreakData(streaks)
      } catch (streakError) {
        console.warn('Streak data not available (database migration may not be complete):', streakError)
        setStreakData(defaultStreakData)
      }
      
    } catch (err) {
      setError('Failed to load sessions')
      console.error('Error loading sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [sessionService])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const addSession = async (sessionData: Omit<StudySession, 'id' | 'timestamp'>) => {
    try {
      setError(null)
      const newSession = await sessionService.saveSession(sessionData)
      
      // Update local state optimistically - add to beginning to maintain newest-first order
      setSessions(prev => [newSession, ...prev])
      
      // Refresh stats 
      const updatedStats = await sessionService.getSessionStats()
      setSessionStats(updatedStats)
      
      // Try to refresh streak data - don't fail if it doesn't work
      try {
        const updatedStreaks = await sessionService.getStreakData()
        setStreakData(updatedStreaks)
      } catch (streakError) {
        console.warn('Could not refresh streak data:', streakError)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save session'
      setError(errorMessage)
      console.error('Error saving session:', err)
      
      // Show user-friendly error message
      if (errorMessage.includes('Authentication expired')) {
        alert('Your session has expired. Please refresh the page and log in again.')
      } else if (errorMessage.includes('Failed to save session')) {
        alert('Unable to save your study session. Please check your internet connection and try again.')
      }
      
      throw err
    }
  }

  const refreshSessions = async () => {
    await loadSessions()
  }

  const clearAllSessions = async () => {
    try {
      setError(null)
      await sessionService.clearAllSessions()
      setSessions([])
      setSessionStats(defaultSessionStats)
    } catch (err) {
      setError('Failed to clear sessions')
      console.error('Error clearing sessions:', err)
      throw err
    }
  }

  const value: SessionContextType = {
    sessions,
    sessionStats,
    streakData,
    loading,
    error,
    addSession,
    refreshSessions,
    clearAllSessions
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}