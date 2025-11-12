import Image from 'next/image'

export function Footer () {
  return (
    <footer className="w-full bg-[#1C1B20] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/logos/248-logo.svg"
              alt="248.AI"
              width={120}
              height={40}
              className="h-10 w-auto brightness-0 invert"
            />
          </div>

          {/* Copyright */}
          <p className="text-white text-sm">
            © 2025 248.AI
          </p>
        </div>
      </div>
    </footer>
  )
}

