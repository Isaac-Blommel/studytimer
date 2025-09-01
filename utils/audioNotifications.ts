import { AUDIO_FREQUENCIES, AUDIO_DURATIONS, AUDIO_VOLUMES } from '../constants/audio'

// Simple bell sound using Web Audio API or data URL
const NOTIFICATION_SOUND_DATA_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmkaCS6a2+zQeSgELYHO8tiJOQcZbL3t559DEQ1Nq+L1t2AVBzuH0fLNeSUBJXfH8N2QQQkUXrTp66hVEQpHn+DyvmkaCS6a2+zQeSgELYLO8tiJOQcZbL3t559DEQ1Nq+L1t2AVBzuH0fLNeSUBJXbH8N2QQQkUXrTp66hVEQpHoODyvmkaCS6a2+zQeSgELYLO8tiJOQcZbL3t559DEQ1Nq+L1t2AVBzuH0fLNeSUBJnfH8N2QQAkUXrTp66hVEQpHoODyvmkaCS6b2+zQeSgELYLO8tiJOQcZbL3t559DEQ1Nq+L1t2AVBzuI0fLNeSUBJnfH8N2QQAkUXrTp66hVEQpHoODyvmkaCS6b2+zQeSgELYLO8tiJOQcZbL3t559DEQ1Nq+L1t2AVBzuI0fLNeSUBJnbH8N2QQQkUXrTp66hVEQpHoODyvmkYCS6b2+zQeSgELYLO8tiJOQcZbL3t559DEQ1Nq+L1t2AVBzuI0fLNeSUBJnbH8N2QQQkUXrTp66hVEQpHoODyvmkYCS6b2+zQeSgELYLO8tiJOQcZbL3t559DEQ1Nq+L1t2AVBzuI0fLNeSUBJnfH8N2QQAkUXrTp66hVEQpHoODyvmkYCS6b2+zQeSgELYLO8tiJOQcZbL3t559DEQ1Nq+L1t2AVBzuI0fLNeSUBJnfH8N2QQAkUXrTp66hVEQpHoODyvmkYCS6b2+zQeSgELYLO8tiJOQcZbL3t559DEQ1Nq+L1t2AVBzuI0fLNeSUBJnfH8N2QQAkUXrTp66hVEQpHn+DyvmkYCS6b2+zQeSgE'

// Audio context for generating simple tones
let audioContext: AudioContext | null = null

interface NotificationOptions {
  volume?: number
  frequency?: number
  duration?: number
  type?: 'sine' | 'triangle' | 'square' | 'sawtooth'
}

export class AudioNotificationService {
  private static instance: AudioNotificationService
  private isEnabled = true

  static getInstance(): AudioNotificationService {
    if (!AudioNotificationService.instance) {
      AudioNotificationService.instance = new AudioNotificationService()
    }
    return AudioNotificationService.instance
  }

  private constructor() {
    // Initialize audio context on first user interaction
    if (typeof window !== 'undefined') {
      this.initializeAudioContext()
    }
  }

  private async initializeAudioContext() {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
      }
      
      // Resume audio context if suspended (required for Chrome)
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }
    } catch (error) {
      console.warn('Audio context initialization failed:', error)
      this.isEnabled = false
    }
  }

  async playTransitionSound(options: NotificationOptions = {}) {
    if (!this.isEnabled || typeof window === 'undefined') return

    const {
      volume = 0.3,
      frequency = 800,
      duration = 200,
      type = 'sine'
    } = options

    try {
      await this.initializeAudioContext()
      
      if (!audioContext) return

      // Create oscillator for tone
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = type

      // Create envelope for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)

    } catch (error) {
      console.warn('Failed to play transition sound:', error)
      // Fallback: try to play a simple beep using HTML5 audio
      this.playFallbackSound()
    }
  }

  private playFallbackSound() {
    try {
      // Create a simple beep using HTML5 audio
      const audio = new Audio()
      audio.src = NOTIFICATION_SOUND_DATA_URL
      audio.volume = 0.3
      audio.play().catch(() => {
        // Silent fail if audio can't be played
      })
    } catch (error) {
      // Silent fail - audio notifications not critical
    }
  }

  // Different sound presets for different transitions
  async playStudyStartSound() {
    await this.playTransitionSound({
      frequency: AUDIO_FREQUENCIES.STUDY_START,
      duration: AUDIO_DURATIONS.SHORT_BEEP,
      type: 'triangle',
      volume: AUDIO_VOLUMES.NORMAL
    })
  }

  async playBreakStartSound() {
    await this.playTransitionSound({
      frequency: AUDIO_FREQUENCIES.BREAK_START,
      duration: AUDIO_DURATIONS.LONG_BEEP,
      type: 'sine',
      volume: AUDIO_VOLUMES.NORMAL
    })
  }

  async playSessionCompleteSound() {
    // Play a sequence of tones for completion
    await this.playTransitionSound({
      frequency: AUDIO_FREQUENCIES.SESSION_COMPLETE,
      duration: AUDIO_DURATIONS.SEQUENCE_DELAY,
      type: 'triangle',
      volume: AUDIO_VOLUMES.NORMAL
    })
    
    setTimeout(async () => {
      await this.playTransitionSound({
        frequency: 659, // E5
        duration: 200,
        type: 'triangle',
        volume: 0.3
      })
    }, 250)
    
    setTimeout(async () => {
      await this.playTransitionSound({
        frequency: 784, // G5
        duration: 400,
        type: 'triangle',
        volume: 0.3
      })
    }, 500)
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  isAudioEnabled(): boolean {
    return this.isEnabled
  }
}

export const audioNotifications = AudioNotificationService.getInstance()