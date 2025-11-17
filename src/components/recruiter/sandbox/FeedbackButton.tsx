import { cn } from '@/lib/utils'

interface FeedbackButtonProps {
  text: string
  onClick?: () => void
  selected?: boolean
}

export function FeedbackButton({ text, onClick, selected = false }: FeedbackButtonProps) {
  return (
    <button
      className={cn(
        "w-full text-left py-2.5 px-4 rounded-lg text-sm transition-colors",
        selected 
          ? "bg-blue-600 text-white ring-2 ring-blue-300 font-medium" 
          : "bg-blue-100 text-blue-900 hover:bg-blue-200"
      )}
      onClick={onClick}
      aria-pressed={selected}
      role="button"
    >
      {text}
    </button>
  )
}
