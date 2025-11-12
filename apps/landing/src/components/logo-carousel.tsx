import Image from 'next/image'

const customerLogos = [
  { name: 'Cvent', src: '/customer-logos/cvent.png', width: 140 },
  { name: 'Realtor.com', src: '/customer-logos/realtor.png', width: 180 },
  { name: 'Provi', src: '/customer-logos/provi.png', width: 120 },
  { name: 'SpotOn', src: '/customer-logos/spoton.png', width: 165 }
]

export function LogoCarousel () {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-center gap-8 md:gap-12 lg:gap-16 px-4">
        {customerLogos.map((logo) => (
          <div
            key={logo.name}
            className="relative opacity-70 hover:opacity-90 transition-opacity duration-300"
            style={{ height: '80px', width: `${logo.width * 1.5}px` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Image
                src={logo.src}
                alt={`${logo.name} logo`}
                width={logo.width * 1.5}
                height={80}
                className="object-contain grayscale"
                style={{ maxHeight: '80px', width: 'auto' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

