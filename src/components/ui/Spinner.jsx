import { cn } from '@/lib/utils'

export function Spinner({ className }) {
  return (
    <div className={cn('inline-block w-5 h-5 rounded-full border-2 border-ocv-cyan border-t-transparent animate-spin', className)} />
  )
}

export function PageSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <Spinner className="w-10 h-10" />
      <p className="text-ink-400 text-sm">Cargando...</p>
    </div>
  )
}
