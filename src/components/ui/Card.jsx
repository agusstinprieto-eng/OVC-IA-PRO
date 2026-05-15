import { cn } from '@/lib/utils'

export function Card({ className, hover = false, glow = false, children, ...props }) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-xl bg-surface-800 border border-surface-600 overflow-hidden',
        hover && 'transition-all duration-300 hover:-translate-y-1 hover:border-ocv-cyan/50 hover:shadow-glow-cyan',
        glow  && 'border-ocv-cyan/30 shadow-glow-cyan',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardBody({ className, children }) {
  return <div className={cn('p-4 md:p-5', className)}>{children}</div>
}
