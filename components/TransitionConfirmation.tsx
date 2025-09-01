'use client'

interface TransitionConfirmationProps {
  show: boolean
  fromType: 'study' | 'break'
  toType: 'study' | 'break'
  onConfirm: () => void
  onCancel: () => void
}

const TransitionConfirmation = ({ 
  show, 
  fromType, 
  toType, 
  onConfirm, 
  onCancel 
}: TransitionConfirmationProps) => {
  if (!show) return null

  const getTransitionMessage = () => {
    if (fromType === 'study' && toType === 'break') {
      return {
        title: 'Study Session Complete!',
        message: 'Great work! You\'ve finished your study session. Ready to take a break?',
        confirmText: 'Start Break',
        cancelText: 'Continue Studying'
      }
    } else if (fromType === 'break' && toType === 'study') {
      return {
        title: 'Break Time Over!',
        message: 'Your break is complete. Ready to get back to studying?',
        confirmText: 'Start Studying',
        cancelText: 'Extend Break'
      }
    }
    
    return {
      title: 'Ready for Next Stage?',
      message: 'Are you ready to continue to the next part of your session?',
      confirmText: 'Continue',
      cancelText: 'Stay Here'
    }
  }

  const { title, message, confirmText, cancelText } = getTransitionMessage()

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-md animate-bounce-in" style={{height: '100vh', width: '100vw'}}>
      <div className="glass-effect rounded-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 animate-scale-in border-2 border-primary/50">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
            {toType === 'break' ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {title}
          </h2>
          <p className="text-muted text-lg">
            {message}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className="w-full py-3 px-8 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 button-glow font-semibold text-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransitionConfirmation