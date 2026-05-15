import { cn } from '@/lib/utils'

const variants = {
  primary:   'bg-ocv-cyan text-surface-950 font-bold hover:bg-ocv-cyan-bright shadow-glow-cyan hover:shadow-glow-cyan active:scale-95',
  secondary: 'bg-surface-700 text-ink-200 border border-ocv-cyan/40 hover:border-ocv-cyan hover:text-ocv-cyan',
  ghost:     'text-ocv-cyan hover:bg-ocv-cyan/10',
  danger:    'bg-red-600/20 text-red-400 border border-red-600/40 hover:bg-red-600/30',
  yellow:    'bg-ocv-yellow text-surface-950 font-bold hover:brightness-110 shadow-glow-yellow active:scale-95',
}

const sizes = {
  sm:  'px-3 py-1.5 text-sm',
  md:  'px-5 py-2.5 text-base',
  lg:  'px-7 py-3.5 text-lg',
  xl:  'px-8 py-4 text-xl',
  icon:'p-2',
}

export function Button({ variant = 'primary', size = 'md', className, disabled, children, ...props }) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-body transition-all duration-200 focus-visible:outline-2 focus-visible:outline-ocv-cyan',
        variants[variant],
        sizes[size],
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {children}
    </button>
  )
}
