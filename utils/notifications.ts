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
    if ('Notification' in window) {
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
    if (!('Notification' in window)) {
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
    if (!this.isEnabled()) {
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
      title: 'Break Time! 🌟',
      body: `Time for a ${duration} minute break. Rest and recharge!`,
      tag: 'break-start',
      requireInteraction: false
    })
  }

  showStudyStart(duration: number) {
    return this.show({
      title: 'Study Time! 📚',
      body: `Back to studying for ${duration} minutes. Stay focused!`,
      tag: 'study-start',
      requireInteraction: false
    })
  }

  showSessionComplete(duration: number) {
    return this.show({
      title: 'Session Complete! 🎉',
      body: `Great job! You studied for ${duration} minutes. Time to log what you learned.`,
      tag: 'session-complete',
      requireInteraction: true
    })
  }

  showStudyReminder() {
    return this.show({
      title: 'Study Reminder 📖',
      body: 'Ready to continue your learning journey?',
      tag: 'study-reminder',
      requireInteraction: false
    })
  }

  // Play notification sound (fallback for when notifications are disabled)
  playSound(type: 'break' | 'study' | 'complete' = 'complete') {
    // Only run on client-side
    if (typeof window === 'undefined') return
    
    try {
      // Check if AudioContext is available
      if (!window.AudioContext && !(window as Window & {webkitAudioContext?: typeof AudioContext}).webkitAudioContext) {
        console.warn('AudioContext not supported')
        return
      }
      
      // Create audio context for different notification sounds
      const AudioContextClass = window.AudioContext || (window as Window & {webkitAudioContext?: typeof AudioContext}).webkitAudioContext
      const audioContext = new AudioContextClass()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Different frequencies for different notification types
      const frequencies = {
        break: [523.25, 659.25], // C5, E5
        study: [440, 554.37], // A4, C#5
        complete: [523.25, 659.25, 783.99] // C5, E5, G5
      }

      const freq = frequencies[type]
      oscillator.frequency.setValueAtTime(freq[0], audioContext.currentTime)
      
      if (freq.length > 1) {
        oscillator.frequency.setValueAtTime(freq[1], audioContext.currentTime + 0.2)
      }
      if (freq.length > 2) {
        oscillator.frequency.setValueAtTime(freq[2], audioContext.currentTime + 0.4)
      }

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.6)
    } catch (error) {
      console.warn('Could not play notification sound:', error)
    }
  }
}

export const notifications = StudyNotifications.getInstance()