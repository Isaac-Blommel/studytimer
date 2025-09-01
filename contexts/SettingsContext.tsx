'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { audioNotifications } from '@/utils/audioNotifications'

interface SettingsState {
  soundEnabled: boolean
  autoBreaks: boolean
  desktopNotifications: boolean
  developmentMode: boolean
}

interface SettingsContextType {
  settings: SettingsState
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void
  requestNotificationPermission: () => Promise<boolean>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const SETTINGS_STORAGE_KEY = 'study-timer-settings'

const defaultSettings: SettingsState = {
  soundEnabled: true,
  autoBreaks: true,
  desktopNotifications: false,
  developmentMode: false
}

// Utility function to safely parse and validate settings
const parseAndValidateSettings = (parsed: unknown): SettingsState => {
  const settings: SettingsState = { ...defaultSettings }
  
  if (typeof parsed === 'object' && parsed !== null) {
    // Validate each setting with fallback to default
    const parsedObj = parsed as Record<string, unknown>
    Object.keys(settings).forEach(key => {
      const settingKey = key as keyof SettingsState
      if (settingKey in parsedObj && typeof parsedObj[settingKey] === 'boolean') {
        settings[settingKey] = parsedObj[settingKey] as boolean
      }
    })
  }
  
  return settings
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(parseAndValidateSettings(parsed))
      }
    } catch (error) {
      console.error('Error loading settings, using defaults:', error)
      localStorage.removeItem(SETTINGS_STORAGE_KEY)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
      
      // Apply sound setting to audio notification service
      audioNotifications.setEnabled(settings.soundEnabled)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }, [settings])

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  const value: SettingsContextType = {
    settings,
    updateSetting,
    requestNotificationPermission
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

