import { LogoCarousel } from './logo-carousel'

export function TrustedBySection () {
  return (
    <section className="hidden md:block py-16 bg-gradient-to-b from-transparent via-white/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl sm:text-2xl text-[#777D8D] mb-12">
          Trusted By
        </h2>
        <LogoCarousel />
      </div>
    </section>
  )
}

