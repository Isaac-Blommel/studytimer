'use client'

import { useState } from 'react'
import Navigation from '../../components/Navigation'

const SettingsPage = () => {
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoBreaks, setAutoBreaks] = useState(false)
  const [notifications, setNotifications] = useState(true)

  const toggleSetting = (setting: string) => {
    switch (setting) {
      case 'sound':
        setSoundEnabled(!soundEnabled)
        break
      case 'autoBreaks':
        setAutoBreaks(!autoBreaks)
        break
      case 'notifications':
        setNotifications(!notifications)
        break
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-slide-in">
            <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-xl text-muted">Customize your study experience</p>
          </div>

          <div className="space-y-6 animate-slide-in">
            <div className="glass-effect rounded-xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Timer Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">Sound Notifications</div>
                    <div className="text-sm text-muted">Play sound when timer completes</div>
                  </div>
                  <button 
                    onClick={() => toggleSetting('sound')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      soundEnabled ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      soundEnabled ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">Auto-start Breaks</div>
                    <div className="text-sm text-muted">Automatically start break timers</div>
                  </div>
                  <button 
                    onClick={() => toggleSetting('autoBreaks')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      autoBreaks ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      autoBreaks ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">Desktop Notifications</div>
                    <div className="text-sm text-muted">Show browser notifications for session updates</div>
                  </div>
                  <button 
                    onClick={() => toggleSetting('notifications')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      notifications ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      notifications ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">Account & Data</h3>
              <div className="space-y-4">
                <button className="w-full bg-primary hover:bg-primary-hover text-white py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-left">
                  Connect Google Calendar
                </button>
                <button className="w-full bg-secondary hover:bg-border text-foreground py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-left">
                  Export Study Data
                </button>
                <button className="w-full bg-secondary hover:bg-border text-foreground py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-left">
                  Import Study Data
                </button>
                <button className="w-full bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30 py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 text-left">
                  Clear All Data
                </button>
              </div>
            </div>

            <div className="glass-effect rounded-xl p-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">About</h3>
              <div className="text-center space-y-3">
                <div className="text-muted">StudyTimer v1.0.0</div>
                <div className="text-sm text-muted">
                  Built with Next.js, TypeScript, and Tailwind CSS
                </div>
                <div className="text-sm text-muted">
                  Designed to help you focus and maintain healthy study habits
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage