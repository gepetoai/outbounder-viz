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
        selected ? "bg-blue-500 text-white" : "bg-blue-400 text-white"
      )}
      onClick={onClick}
    >
      {text}
    </button>
  )
}
