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
        "w-full text-left py-2.5 px-4 rounded-lg text-sm transition-colors border",
        selected
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200"
      )}
      onClick={onClick}
      aria-pressed={selected}
      role="button"
    >
      {text}
    </button>
  )
}
