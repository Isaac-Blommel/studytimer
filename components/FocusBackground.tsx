'use client'

const FocusBackground = () => {
  return (
    <>
      {/* Floating particles */}
      <div className="focus-particles">
        <div className="focus-particle"></div>
        <div className="focus-particle"></div>
        <div className="focus-particle"></div>
        <div className="focus-particle"></div>
        <div className="focus-particle"></div>
        <div className="focus-particle"></div>
        <div className="focus-particle"></div>
        <div className="focus-particle"></div>
        <div className="focus-particle"></div>
      </div>

      {/* Orbiting elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="focus-orb focus-orb-1"></div>
        <div className="focus-orb focus-orb-2"></div>
        <div className="focus-orb focus-orb-3"></div>
        
        {/* Additional ambient elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-pulse-gentle"></div>
        <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-accent/5 rounded-full blur-2xl animate-pulse-gentle" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2/3 left-1/3 w-20 h-20 bg-warning/5 rounded-full blur-2xl animate-pulse-gentle" style={{animationDelay: '2s'}}></div>
      </div>
    </>
  )
}

export default FocusBackground