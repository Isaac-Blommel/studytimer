'use client'

import Navigation from '../../components/Navigation'
import { useSettings } from '../../contexts/SettingsContext'

const SettingsPage = () => {
  const { settings, updateSetting, requestNotificationPermission } = useSettings()

  const handleToggle = async (setting: keyof typeof settings) => {
    if (setting === 'desktopNotifications' && !settings.desktopNotifications) {
      // Request permission before enabling
      const granted = await requestNotificationPermission()
      if (!granted) {
        alert('Desktop notifications permission denied. Please enable in browser settings.')
        return
      }
    }
    
    updateSetting(setting, !settings[setting])
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
                    onClick={() => handleToggle('soundEnabled')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      settings.soundEnabled ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      settings.soundEnabled ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">Auto-start Breaks</div>
                    <div className="text-sm text-muted">Automatically start break timers</div>
                  </div>
                  <button 
                    onClick={() => handleToggle('autoBreaks')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      settings.autoBreaks ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      settings.autoBreaks ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">Desktop Notifications</div>
                    <div className="text-sm text-muted">Show browser notifications for session updates</div>
                  </div>
                  <button 
                    onClick={() => handleToggle('desktopNotifications')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${
                      settings.desktopNotifications ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      settings.desktopNotifications ? 'right-0.5' : 'left-0.5'
                    }`}></div>
                  </button>
                </div>

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