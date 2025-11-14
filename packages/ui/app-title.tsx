'use client'

interface AppTitleProps {
  title: string
  subtitle?: string
  className?: string
}

export function AppTitle ({ title, subtitle, className = '' }: AppTitleProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <h1 
        className="text-2xl font-bold"
        style={{ color: '#1C1B20' }}
      >
        {title}
      </h1>
      {subtitle && (
        <p 
          className="mt-1 text-sm"
          style={{ color: '#777D8D' }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}


