import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          duration: number
          break_duration?: number
          method: string
          notes?: string
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          duration: number
          break_duration?: number
          method: string
          notes?: string
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          duration?: number
          break_duration?: number
          method?: string
          notes?: string
          completed_at?: string
          created_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          user_id: string
          total_study_time: number
          total_sessions: number
          current_streak: number
          longest_streak: number
          last_study_date?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_study_time?: number
          total_sessions?: number
          current_streak?: number
          longest_streak?: number
          last_study_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_study_time?: number
          total_sessions?: number
          current_streak?: number
          longest_streak?: number
          last_study_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}