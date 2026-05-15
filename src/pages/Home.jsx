import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection }         from '@/components/landing/HeroSection'
import { StatsBar }            from '@/components/landing/StatsBar'
import { FeaturedEventsStrip } from '@/components/landing/FeaturedEventsStrip'
import { TourismSection }      from '@/components/landing/TourismSection'
import { VenuesSection }       from '@/components/landing/VenuesSection'
import { GastronomySection }   from '@/components/landing/GastronomySection'
import { CTASection }          from '@/components/landing/CTASection'

export default function Home() {
  return (
    <div className="min-h-screen bg-surface-950 flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StatsBar />
        <FeaturedEventsStrip />
        <TourismSection />
        <VenuesSection />
        <GastronomySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
