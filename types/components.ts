export interface ParticleData {
  id: number
  x: number
  y: number
  color: string
  rotation: number
  scale: number
  velocity: { x: number; y: number }
  shape: 'square' | 'circle' | 'triangle'
}

export interface Achievement {
  type: 'streak' | 'time' | 'sessions' | 'milestone'
  value: number
}

export interface StudySegment {
  start: number
  end: number
  type: 'study' | 'break'
}

export interface TimerMethod {
  id: string
  name: string
  duration: number
  breakDuration: number
  description: string
}

export interface MethodVariation {
  work: number
  break: number
  label: string
  popular?: boolean
}