'use client'

import { useEffect, useRef } from 'react'

interface Dot {
  x: number
  y: number
  size: number
  opacity: number
  vx: number
  vy: number
}

export function AnimatedDots () {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const animationFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createDots = () => {
      const dotCount = Math.floor((canvas.width * canvas.height) / 15000)
      dotsRef.current = []

      for (let i = 0; i < dotCount; i++) {
        const sizeRandom = Math.random()
        let size: number
        
        if (sizeRandom < 0.6) {
          size = 2 + Math.random() * 2 // Small: 2-4px
        } else if (sizeRandom < 0.85) {
          size = 6 + Math.random() * 2 // Medium: 6-8px
        } else {
          size = 10 + Math.random() * 2 // Large: 10-12px
        }

        dotsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size,
          opacity: 0.1 + Math.random() * 0.3, // 0.1 to 0.4
          vx: (Math.random() - 0.5) * 0.2, // Slow drift
          vy: (Math.random() - 0.5) * 0.2
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      dotsRef.current.forEach(dot => {
        // Update position
        dot.x += dot.vx
        dot.y += dot.vy

        // Wrap around edges
        if (dot.x < -dot.size) dot.x = canvas.width + dot.size
        if (dot.x > canvas.width + dot.size) dot.x = -dot.size
        if (dot.y < -dot.size) dot.y = canvas.height + dot.size
        if (dot.y > canvas.height + dot.size) dot.y = -dot.size

        // Draw dot
        ctx.fillStyle = `rgba(119, 125, 141, ${dot.opacity})` // #777D8D with opacity
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size / 2, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    createDots()
    animate()

    window.addEventListener('resize', () => {
      resizeCanvas()
      createDots()
    })

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}

