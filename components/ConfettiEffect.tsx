'use client'

import { useEffect, useState } from 'react'
import { CONFETTI_CONFIG } from '../constants/effects'
import { ParticleData } from '../types/components'

interface ConfettiEffectProps {
  isActive: boolean
  duration?: number
  onComplete?: () => void
}

const ConfettiEffect = ({ isActive, duration = CONFETTI_CONFIG.DEFAULT_DURATION, onComplete }: ConfettiEffectProps) => {
  const [particles, setParticles] = useState<ParticleData[]>([])

  useEffect(() => {
    if (!isActive) {
      setParticles([])
      return
    }

    const colors = CONFETTI_CONFIG.COLORS
    const shapes = CONFETTI_CONFIG.SHAPES
    
    const newParticles = Array.from({ length: CONFETTI_CONFIG.PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: Math.random() * 2 + 1
      },
      shape: shapes[Math.floor(Math.random() * shapes.length)]
    }))

    setParticles(newParticles)

    const timeout = setTimeout(() => {
      setParticles([])
      onComplete?.()
    }, duration)

    return () => clearTimeout(timeout)
  }, [isActive, duration, onComplete])

  if (!isActive || particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute transition-all duration-1000 ease-out`}
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
            animation: `confettiFall ${duration}ms ease-out forwards`,
            animationDelay: `${Math.random() * 500}ms`
          }}
        >
          {particle.shape === 'square' && (
            <div 
              className="w-3 h-3"
              style={{ backgroundColor: particle.color }}
            />
          )}
          {particle.shape === 'circle' && (
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: particle.color }}
            />
          )}
          {particle.shape === 'triangle' && (
            <div 
              className="w-0 h-0"
              style={{ 
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: `10px solid ${particle.color}`
              }}
            />
          )}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes confettiFall {
          to {
            transform: translateY(${window.innerHeight + 100}px) translateX(${Math.random() * 200 - 100}px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default ConfettiEffect