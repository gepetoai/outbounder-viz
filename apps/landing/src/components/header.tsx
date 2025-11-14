import Image from 'next/image'
// import { Button } from './ui/button'

export function Header () {
  return (
    <header className="w-full bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/logos/248-logo.svg"
              alt="248.AI"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          {/* Login Button */}
          {/* <div>
            <Button
              variant="outline"
              className="border-[#1C1B20] text-[#1C1B20] hover:bg-[#F5F5F5]"
            >
              Login
            </Button>
          </div> */}
        </div>
      </div>
    </header>
  )
}

