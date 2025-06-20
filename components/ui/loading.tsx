import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: number
  className?: string
}

export function Loading({ size = 24, className = "" }: LoadingProps) {
  return <Loader2 className={`animate-spin ${className}`} size={size} />
}
