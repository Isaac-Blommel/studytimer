export const ACHIEVEMENT_THRESHOLDS = {
  TIME_HOUR_1: 60,
  TIME_HOUR_1_5: 90,
  TIME_HOUR_2: 120,
  SESSION_MIN: 25,
  CONFETTI_TRIGGER: 90
} as const

export const ACHIEVEMENT_TYPES = {
  STREAK: 'streak',
  TIME: 'time', 
  SESSIONS: 'sessions',
  MILESTONE: 'milestone'
} as const