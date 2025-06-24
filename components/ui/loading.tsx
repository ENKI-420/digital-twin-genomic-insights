import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2, Loader } from "lucide-react"

import { cn } from "@/lib/utils"

const loadingVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "text-primary",
        secondary: "text-muted-foreground",
        white: "text-white",
      },
      size: {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LoadingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  type?: "spinner" | "dots" | "pulse"
  text?: string
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, variant, size, type = "spinner", text, ...props }, ref) => {
    const renderLoader = () => {
      switch (type) {
        case "dots":
          return (
            <div className="flex space-x-1">
              <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
            </div>
          )
        case "pulse":
          return (
            <div className="h-full w-full bg-current rounded-full animate-pulse"></div>
          )
        default:
          return <Loader2 className="animate-spin" />
      }
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-col items-center justify-center gap-2", className)}
        {...props}
      >
        <div className={cn(loadingVariants({ variant, size }))}>
          {renderLoader()}
        </div>
        {text && (
          <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
        )}
      </div>
    )
  }
)
Loading.displayName = "Loading"

// Full screen loading component
const FullScreenLoading = ({ text = "Loading..." }: { text?: string }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loading size="xl" text={text} />
    </div>
  </div>
)

// Page loading component
const PageLoading = ({ text = "Loading page..." }: { text?: string }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <Loading size="lg" text={text} />
  </div>
)

// Inline loading component
const InlineLoading = ({ text }: { text?: string }) => (
  <div className="flex items-center gap-2">
    <Loading size="sm" />
    {text && <span className="text-sm text-muted-foreground">{text}</span>}
  </div>
)

export { Loading, FullScreenLoading, PageLoading, InlineLoading, loadingVariants }
