
"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

interface CardHoverRevealContextValue {
  isHovered: boolean
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>
}
interface CardHoverRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  isTouchActive?: boolean
  onTouchReveal?: () => void
}
const CardHoverRevealContext = React.createContext<CardHoverRevealContextValue>(
  {} as CardHoverRevealContextValue
)
const useCardHoverRevealContext = () => {
  const context = React.useContext(CardHoverRevealContext)
  if (!context) {
    throw new Error(
      "useCardHoverRevealContext must be used within a CardHoverRevealProvider"
    )
  }
  return context
}
const CardHoverReveal = React.forwardRef<
  HTMLDivElement,
  CardHoverRevealProps
>(({ className, isTouchActive = false, onTouchReveal, onClick, ...props }, ref) => {
  const [isPointerHovered, setIsPointerHovered] = React.useState<boolean>(false)
  const isHovered = isPointerHovered || isTouchActive

  const handleMouseEnter = () => setIsPointerHovered(true)
  const handleMouseLeave = () => setIsPointerHovered(false)
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches
      || window.matchMedia('(max-width: 767px)').matches
    if (isTouchDevice && event.detail > 0 && !isTouchActive) {
      event.preventDefault()
      onTouchReveal?.()
    }
    onClick?.(event)
  }

  return (
    <CardHoverRevealContext.Provider
      value={{
        isHovered,
        setIsHovered: setIsPointerHovered,
      }}
    >
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        {...props}
      />
    </CardHoverRevealContext.Provider>
  )
})
CardHoverReveal.displayName = "CardHoverReveal"

interface CardHoverRevealMainProps {
  initialScale?: number
  hoverScale?: number
}
const CardHoverRevealMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CardHoverRevealMainProps
>(({ className, initialScale = 1, hoverScale = 1.05, ...props }, ref) => {
  const { isHovered } = useCardHoverRevealContext()
  return (
    <div
      ref={ref}
      className={cn("size-full transition-transform duration-700 ease-out", className)}
      style={
        isHovered
          ? { transform: `scale(${hoverScale})`, ...props.style }
          : { transform: `scale(${initialScale})`, ...props.style }
      }
      {...props}
    />
  )
})
CardHoverRevealMain.displayName = "CardHoverRevealMain"

const CardHoverRevealContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isHovered } = useCardHoverRevealContext()
  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-[auto_1.5rem_1.5rem] p-6 backdrop-blur-lg transition-all duration-500 ease-in-out border border-neutral-300 dark:border-white/10",
        className
      )}
      style={
        isHovered
          ? { translate: "0%", opacity: 1, ...props.style }
          : { translate: "0% 40%", opacity: 0, ...props.style }
      }
      {...props}
    />
  )
})
CardHoverRevealContent.displayName = "CardHoverRevealContent"

export { CardHoverReveal, CardHoverRevealMain, CardHoverRevealContent }
