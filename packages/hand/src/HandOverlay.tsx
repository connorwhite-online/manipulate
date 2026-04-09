import React from 'react'

export interface HandOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean
  /** Custom message to display */
  message?: string
  /** CSS class for the outer container */
  className?: string
  /** Custom content to render instead of the default message */
  children?: React.ReactNode
}

/**
 * Overlay hint that prompts the user to show their hand to the camera.
 * Shown when no hand is detected.
 */
export function HandOverlay({
  visible,
  message = "Position your hand within the camera's view with your palm facing forward.",
  className,
  children,
}: HandOverlayProps) {
  if (!visible) return null

  return (
    <div className={className}>
      {children ?? <p>{message}</p>}
    </div>
  )
}
