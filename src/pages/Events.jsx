import { PageLayout } from '@/components/layout/PageLayout'
import { EventList } from '@/components/events/EventList'

export default function Events() {
  return (
    <PageLayout>
      <div className="mb-8">
        <p className="text-xs text-ocv-cyan uppercase tracking-widest font-medium mb-1">OCV Torreón</p>
        <h1 className="font-display text-5xl text-ink-100 tracking-wide">Cartelera de Eventos</h1>
      </div>
      <EventList />
    </PageLayout>
  )
}
