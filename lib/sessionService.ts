import { supabase } from './supabase'
import { StudySession, DatabaseSession } from '../types/services'

export class SessionService {
  private static instance: SessionService

  private constructor() {}

  private mapDatabaseToSession(data: DatabaseSession): StudySession {
    return {
      id: data.id,
      duration: data.duration,
      studyTopic: data.study_topic || '',
      notes: data.notes || '',
      timestamp: new Date(data.created_at),
      method: data.method || '',
      breakDuration: data.break_duration || 0,
      cycles: data.cycles || 1,
      totalDuration: data.total_duration || data.duration,
      completionStatus: data.completion_status || 'completed',
      methodVariation: data.method_variation || ''
    }
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService()
    }
    return SessionService.instance
  }

  private async ensureValidSession(): Promise<void> {
    const { data: { session: authSession }, error: refreshError } = await supabase.auth.getSession()
    
    if (!authSession) {
      const { data: refreshData, error: tokenRefreshError } = await supabase.auth.refreshSession()
      
      if (tokenRefreshError || !refreshData.session) {
        throw new Error('Authentication expired. Please log in again.')
      }
    }
  }

  /**
   * Retrieves all study sessions for the authenticated user.
   * Sessions are ordered by creation date (most recent first).
   * 
   * @returns Promise resolving to array of study sessions
   * @throws Error if user is not authenticated or database query fails
   */
  async getAllSessions(): Promise<StudySession[]> {
    try {
      // Ensure session is valid before making request
      await this.ensureValidSession()
      
      const { data: sessions, error } = await supabase
        .from('study_sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error loading sessions:', error)
        throw new Error('Failed to load sessions from database')
      }

      return sessions.map(session => this.mapDatabaseToSession(session))
    } catch (error) {
      console.error('Error loading sessions:', error)
      throw error
    }
  }

  /**
   * Saves a new study session to the database.
   * Creates user record if it doesn't exist.
   * 
   * @param session - Session data to save (without id and timestamp)
   * @returns Promise resolving to the saved session with id and timestamp
   * @throws Error if user is not authenticated or save operation fails
   */
  async saveSession(session: Omit<StudySession, 'id' | 'timestamp'>): Promise<StudySession> {
    try {
      console.log('🗄️ SessionService.saveSession called with:', session)
      
      // Check current auth state first
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      console.log('🔍 Current auth session:', currentSession ? 'EXISTS' : 'NULL')
      
      if (!currentSession) {
        console.error('❌ No active auth session found!')
        throw new Error('User must be authenticated to save sessions')
      }
      
      // Ensure session is valid before making request
      await this.ensureValidSession()
      console.log('🔐 Session validation passed')
      
      const { data: { user } } = await supabase.auth.getUser()
      console.log('👤 User retrieved:', user?.id)
      
      // Test if we can even SELECT from study_sessions (RLS test)
      const { data: selectTest, error: selectError } = await supabase
        .from('study_sessions')
        .select('*')
        .limit(1)
      
      // Check if user exists in public.users table
      if (user) {
        const { data: publicUser, error: userCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()
        
        
        // If user doesn't exist in public.users, create them
        if (!publicUser && userCheckError?.code === 'PGRST116') {
          const { error: createUserError } = await supabase
            .from('users')
            .insert({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.user_metadata?.full_name || 'Anonymous'
            })
          
          if (createUserError) {
            console.error('Failed to create user in public.users:', createUserError)
          } else {
          }
        }
      }
      
      if (!user) {
        throw new Error('User must be authenticated to save sessions')
      }

      // Complete session data with all fields now that database schema is updated
      const sessionData = {
        user_id: user.id,
        duration: Number(session.duration),
        break_duration: Number(session.breakDuration || 0),
        method: String(session.method || 'Study Session'),
        notes: String(session.notes || ''),
        study_topic: String(session.studyTopic || ''),
        cycles: Number(session.cycles || 1),
        total_duration: Number(session.totalDuration || session.duration),
        completion_status: String(session.completionStatus || 'completed'),
        method_variation: String(session.methodVariation || ''),
        completed_at: new Date().toISOString()
      }
      


      console.log('📊 About to insert session data:', sessionData)

      // Try a simple insert with minimal data first as a test
      const testData = {
        user_id: user.id,
        duration: sessionData.duration,
        method: sessionData.method,
        notes: sessionData.notes || ''
      }

      console.log('🧪 Testing with minimal data first:', testData)

      const { data, error } = await supabase
        .from('study_sessions')
        .insert(sessionData)
        .select()
        .single()

      console.log('📊 Supabase insert result:', { data, error })
      
      if (error) {
        console.error('❌ Supabase error saving session:', error)
        throw new Error('Failed to save session to database')
      }

      if (!data) {
        console.error('❌ No data returned from Supabase insert')
        throw new Error('No data returned from database insert')
      }

      console.log('✅ Session successfully saved to database:', data)
      return this.mapDatabaseToSession(data)
    } catch (error) {
      console.error('Error saving session:', error)
      throw error
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
      // Ensure session is valid before making request
      await this.ensureValidSession()
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return {
          totalStudyTime: 0,
          totalSessions: 0,
          averageSessionLength: 0,
          thisWeekTime: 0,
          thisWeekSessions: 0
        }
      }

      // Get user stats from the database
      const { data: userStats, error: statsError } = await supabase
        .from('user_stats')
        .select('total_study_time, total_sessions')
        .eq('user_id', user.id)
        .single()

      if (statsError && statsError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading user stats:', statsError)
      }

      // Get this week's sessions
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const { data: weekSessions, error: weekError } = await supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString())

      if (weekError) {
        console.error('Error loading week sessions:', weekError)
      }

      const totalStudyTime = userStats?.total_study_time || 0
      const totalSessions = userStats?.total_sessions || 0
      const averageSessionLength = totalSessions > 0 ? Math.round(totalStudyTime / totalSessions) : 0

      const thisWeekSessions = weekSessions || []
      const thisWeekTime = thisWeekSessions.reduce((acc, session) => 
        acc + session.duration, 0)

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
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User must be authenticated to clear sessions')
      }

      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        console.error('Supabase error clearing sessions:', error)
        throw new Error('Failed to clear sessions from database')
      }

      // Reset user stats
      await supabase
        .from('user_stats')
        .update({
          total_study_time: 0,
          total_sessions: 0,
          current_streak: 0,
          longest_streak: 0,
          last_study_date: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

    } catch (error) {
      console.error('Error clearing sessions:', error)
      throw error
    }
  }
}