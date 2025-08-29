export interface StudySession {
  id: string
  duration: number
  studyTopic: string
  notes: string
  timestamp: Date
  method: string
  breakDuration?: number
  cycles?: number
  totalDuration?: number
}

export class SessionService {
  private static instance: SessionService
  private static readonly STORAGE_KEY = 'study-sessions'

  private constructor() {}

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService()
    }
    return SessionService.instance
  }

  async getAllSessions(): Promise<StudySession[]> {
    try {
      const storedSessions = localStorage.getItem(SessionService.STORAGE_KEY)
      if (!storedSessions) {
        return []
      }

      const parsedSessions = JSON.parse(storedSessions)
      return parsedSessions.map((session: StudySession & { timestamp: string }) => ({
        ...session,
        timestamp: new Date(session.timestamp)
      }))
    } catch (error) {
      console.error('Error loading sessions:', error)
      return []
    }
  }

  async saveSession(session: Omit<StudySession, 'id' | 'timestamp'>): Promise<StudySession> {
    try {
      const newSession: StudySession = {
        id: Date.now().toString(),
        timestamp: new Date(),
        ...session
      }

      const existingSessions = await this.getAllSessions()
      const updatedSessions = [...existingSessions, newSession]
      
      localStorage.setItem(SessionService.STORAGE_KEY, JSON.stringify(updatedSessions))
      return newSession
    } catch (error) {
      console.error('Error saving session:', error)
      throw new Error('Failed to save session')
    }
  }

  async getSessionStats(): Promise<{
    totalStudyTime: number
    totalSessions: number
    averageSessionLength: number
    thisWeekTime: number
    thisWeekSessions: number
  }> {
    try {
      const sessions = await this.getAllSessions()
      const totalStudyTime = sessions.reduce((acc, session) => acc + session.duration, 0)
      const totalSessions = sessions.length
      const averageSessionLength = totalSessions > 0 ? Math.round(totalStudyTime / totalSessions) : 0

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const thisWeekSessions = sessions.filter(session => session.timestamp > weekAgo)
      const thisWeekTime = thisWeekSessions.reduce((acc, session) => acc + session.duration, 0)

      return {
        totalStudyTime,
        totalSessions,
        averageSessionLength,
        thisWeekTime,
        thisWeekSessions: thisWeekSessions.length
      }
    } catch (error) {
      console.error('Error calculating session stats:', error)
      return {
        totalStudyTime: 0,
        totalSessions: 0,
        averageSessionLength: 0,
        thisWeekTime: 0,
        thisWeekSessions: 0
      }
    }
  }

  async clearAllSessions(): Promise<void> {
    try {
      localStorage.removeItem(SessionService.STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing sessions:', error)
      throw new Error('Failed to clear sessions')
    }
  }
}