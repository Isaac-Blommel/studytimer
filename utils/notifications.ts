import { AudioNotificationService } from './audioNotifications'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  tag?: string
  requireInteraction?: boolean
}

export class StudyNotifications {
  private static instance: StudyNotifications
  private permission: NotificationPermission = 'default'
  private enabled: boolean = false
  private audioService = AudioNotificationService.getInstance()

  private constructor() {
    this.checkPermission()
    this.loadSettings()
  }

  static getInstance(): StudyNotifications {
    if (!StudyNotifications.instance) {
      StudyNotifications.instance = new StudyNotifications()
    }
    return StudyNotifications.instance
  }

  private checkPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission
    }
  }

  private loadSettings() {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('notification-settings')
      if (stored) {
        const settings = JSON.parse(stored)
        this.enabled = Boolean(settings.enabled)
      }
    } catch (error) {
      console.error('Error loading notification settings, using defaults:', error)
      this.enabled = false
    }
  }

  private saveSettings() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('notification-settings', JSON.stringify({
        enabled: this.enabled
      }))
    } catch (error) {
      console.error('Error saving notification settings:', error)
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (this.permission === 'granted') {
      return true
    }

    try {
      const permission = await Notification.requestPermission()
      this.permission = permission
      return permission === 'granted'
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return false
    }
  }

  async enable(): Promise<boolean> {
    const hasPermission = await this.requestPermission()
    if (hasPermission) {
      this.enabled = true
      this.saveSettings()
      return true
    }
    return false
  }

  disable() {
    this.enabled = false
    this.saveSettings()
  }

  isEnabled(): boolean {
    return this.enabled && this.permission === 'granted'
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission
  }

  show(options: NotificationOptions): Notification | null {
    if (typeof window === 'undefined' || !this.isEnabled()) {
      return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: false,
      })

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close()
        }, 5000)
      }

      return notification
    } catch (error) {
      console.error('Error showing notification:', error)
      return null
    }
  }

  // Predefined notifications for common study events
  showBreakStart(duration: number) {
    return this.show({
      title: 'Break Time!',
      body: `Time for a ${duration} minute break. Rest and recharge!`,
      tag: 'break-start',
      requireInteraction: false
    })
  }

  showStudyStart(duration: number) {
    return this.show({
      title: 'Study Time!',
      body: `Back to studying for ${duration} minutes. Stay focused!`,
      tag: 'study-start',
      requireInteraction: false
    })
  }

  showSessionComplete(duration: number) {
    return this.show({
      title: 'Session Complete!',
      body: `Great job! You studied for ${duration} minutes. Time to log what you learned.`,
      tag: 'session-complete',
      requireInteraction: true
    })
  }

  showStudyReminder() {
    return this.show({
      title: 'Study Reminder',
      body: 'Ready to continue your learning journey?',
      tag: 'study-reminder',
      requireInteraction: false
    })
  }

  // Play notification sound using dedicated audio service
  async playSound(type: 'break' | 'study' | 'complete' = 'complete') {
    try {
      switch (type) {
        case 'break':
          await this.audioService.playBreakStartSound()
          break
        case 'study':
          await this.audioService.playStudyStartSound()
          break
        case 'complete':
          await this.audioService.playSessionCompleteSound()
          break
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error)
    }
  }
}

export const notifications = StudyNotifications.getInstance()