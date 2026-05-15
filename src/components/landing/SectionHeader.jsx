import { cn } from '@/lib/utils'

export function SectionHeader({ eyebrow, title, subtitle, center = false, light = false, className }) {
  return (
    <div className={cn('space-y-2', center && 'text-center', className)}>
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-ocv-cyan">{eyebrow}</p>
      )}
      <h2 className={cn(
        'font-display tracking-wide leading-none',
        light ? 'text-surface-900' : 'text-ink-100',
        'text-4xl sm:text-5xl'
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn('text-base leading-relaxed max-w-2xl', center && 'mx-auto', light ? 'text-surface-600' : 'text-ink-400')}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
