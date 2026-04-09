import React, { useState, forwardRef } from 'react'
import Webcam from 'react-webcam'

export interface HandCameraProps {
  /** Mirror the video feed (default: true) */
  mirrored?: boolean
  /** CSS class for the outer container */
  className?: string
  /** Whether the camera starts expanded (default: true) */
  defaultExpanded?: boolean
  /** Label shown when collapsed (default: 'Camera') */
  collapsedLabel?: string
  /** Render prop for the collapse button content */
  collapseIcon?: React.ReactNode
  /** Render prop for the expand button content */
  expandIcon?: React.ReactNode
}

/**
 * Drop-in webcam display component with collapse/expand functionality.
 * Forward a ref to access the underlying Webcam instance for hand detection.
 */
export const HandCamera = forwardRef<Webcam, HandCameraProps>(
  (
    {
      mirrored = true,
      className,
      defaultExpanded = true,
      collapsedLabel = 'Camera',
      collapseIcon,
      expandIcon,
    },
    ref,
  ) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)
    const [isHovered, setIsHovered] = useState(false)

    const toggleExpanded = () => setIsExpanded((v) => !v)

    return (
      <div className={className} style={{ position: 'relative' }}>
        {/* Webcam is always mounted for detection, but visually hidden when collapsed */}
        <Webcam
          ref={ref}
          mirrored={mirrored}
          style={{
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? 'auto' : 'none',
            position: isExpanded ? 'static' : 'absolute',
            zIndex: isExpanded ? 'auto' : -1,
          }}
        />

        {isExpanded ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              cursor: 'pointer',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.3)',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded()
              }}
            >
              {collapseIcon ?? <span style={{ color: 'white', fontSize: 14 }}>Collapse</span>}
            </div>
          </div>
        ) : (
          <div
            style={{ cursor: 'pointer', padding: '8px 12px' }}
            onClick={toggleExpanded}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{collapsedLabel}</span>
              {expandIcon}
            </span>
          </div>
        )}
      </div>
    )
  },
)

HandCamera.displayName = 'HandCamera'
