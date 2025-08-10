import type React from "react"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "blue" | "white"
  size?: "default" | "sm" | "lg"
  children: React.ReactNode
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"

    const variants = {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-input hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      blue: "bg-blue-600 text-white hover:bg-blue-700 border-0",
      white: "bg-white text-blue-600 hover:bg-gray-50 border border-blue-600",
    }

    const sizes = {
      default: "h-10 py-2 px-4",
      sm: "h-9 px-3 rounded-md text-sm",
      lg: "h-11 px-8 rounded-md",
    }

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], "font-semibold text-sm", className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  },
)

CustomButton.displayName = "CustomButton"

export { CustomButton }
