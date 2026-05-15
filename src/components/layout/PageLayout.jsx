import { Header } from './Header'
import { Footer } from './Footer'

export function PageLayout({ children, noPad = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-900">
      <Header />
      <main className={noPad ? 'flex-1' : 'flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8'}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
