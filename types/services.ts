export interface DatabaseSession {
  id: string
  user_id: string
  duration: number
  study_topic?: string
  notes?: string
  created_at: string
  method?: string
  break_duration?: number
  cycles?: number
  total_duration?: number
  completion_status?: string
  method_variation?: string
}

export interface StudySession {
  id: string
  duration: number
  studyTopic: string
  notes: string
  timestamp: Date
  method: string
  breakDuration: number
  cycles?: number
  totalDuration: number
  completionStatus: string
  methodVariation: string
}

export type NotificationType = 'break' | 'study' | 'complete'

export interface NotificationSettings {
  enabled: boolean
  desktopNotifications: boolean
  soundEnabled: boolean
}

export interface AudioOptions {
  volume?: number
  frequency?: number
  duration?: number
  type?: 'sine' | 'triangle' | 'square' | 'sawtooth'
}