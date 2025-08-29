'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { SessionService, StudySession } from '../lib/sessionService'

interface SessionContextType {
  sessions: StudySession[]
  sessionStats: {
    totalStudyTime: number
    totalSessions: number
    averageSessionLength: number
    thisWeekTime: number
    thisWeekSessions: number
  }
  loading: boolean
  error: string | null
  addSession: (session: Omit<StudySession, 'id' | 'timestamp'>) => Promise<void>
  refreshSessions: () => Promise<void>
  clearAllSessions: () => Promise<void>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<StudySession[]>([])
  const [sessionStats, setSessionStats] = useState({
    totalStudyTime: 0,
    totalSessions: 0,
    averageSessionLength: 0,
    thisWeekTime: 0,
    thisWeekSessions: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const sessionService = SessionService.getInstance()

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [loadedSessions, stats] = await Promise.all([
        sessionService.getAllSessions(),
        sessionService.getSessionStats()
      ])
      
      setSessions(loadedSessions)
      setSessionStats(stats)
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
      
      // Update local state optimistically
      setSessions(prev => [...prev, newSession])
      
      // Refresh stats
      const updatedStats = await sessionService.getSessionStats()
      setSessionStats(updatedStats)
    } catch (err) {
      setError('Failed to save session')
      console.error('Error saving session:', err)
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
      setSessionStats({
        totalStudyTime: 0,
        totalSessions: 0,
        averageSessionLength: 0,
        thisWeekTime: 0,
        thisWeekSessions: 0
      })
    } catch (err) {
      setError('Failed to clear sessions')
      console.error('Error clearing sessions:', err)
      throw err
    }
  }

  const value: SessionContextType = {
    sessions,
    sessionStats,
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