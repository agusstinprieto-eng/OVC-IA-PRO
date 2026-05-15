import { useEffect, useRef, useState } from 'react'

const STATS = [
  { value: 120,  suffix: '+', label: 'Eventos al año'         },
  { value: 28,   suffix: '+', label: 'Recintos certificados'  },
  { value: 4800, suffix: '+', label: 'Habitaciones de hotel'  },
  { value: 50,   suffix: 'K+',label: 'Visitantes anuales'     },
]

function useCountUp(target, active, duration = 1800) {
  const [count, setCount] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    if (!active) return
    const start   = performance.now()
    const animate = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) frame.current = requestAnimationFrame(animate)
    }
    frame.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame.current)
  }, [active, target, duration])

  return count
}

function StatItem({ value, suffix, label, active }) {
  const count = useCountUp(value, active)
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-6 text-center">
      <p className="font-display text-5xl text-ocv-cyan text-glow-cyan leading-none">
        {count.toLocaleString('es-MX')}{suffix}
      </p>
      <p className="text-sm text-ink-400 uppercase tracking-widest font-medium">{label}</p>
    </div>
  )
}

export function StatsBar() {
  const ref    = useRef(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative border-y border-ocv-cyan/15 bg-surface-900/80 backdrop-blur-sm overflow-hidden">
      {/* Accent line top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ocv-cyan/40 to-transparent" />

      <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-surface-700">
        {STATS.map((s) => (
          <StatItem key={s.label} {...s} active={active} />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-ocv-cyan/40 to-transparent" />
    </div>
  )
}
