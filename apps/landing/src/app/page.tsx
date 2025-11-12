import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { Footer } from '@/components/footer'

export default function LandingPage () {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
    </div>
  )
}
