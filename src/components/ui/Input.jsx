import { cn } from '@/lib/utils'

export function Input({ className, label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-ink-300 font-medium">{label}</label>}
      <input
        {...props}
        className={cn(
          'w-full rounded-lg bg-surface-700 border border-surface-500 px-4 py-2.5 text-ink-100 placeholder:text-ink-400',
          'focus:outline-none focus:border-ocv-cyan focus:ring-1 focus:ring-ocv-cyan/40',
          'transition-colors duration-150',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/40',
          className
        )}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
