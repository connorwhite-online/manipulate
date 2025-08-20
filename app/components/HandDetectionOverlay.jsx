"use client"

import React from 'react'
import Icon from './Icon'

export default function HandDetectionOverlay({ visible }) {
  return (
    <div className={`hand-detection-overlay ${visible ? 'visible' : 'hidden'}`}>
      <div className="hand-detection-content">
        <div className="hand-icon-container">
          <Icon name="hand" size={32} className="hand-detection-icon" />
        </div>
        <p className="hand-detection-text">
          Position your hand within the camera&apos;s view with your palm facing forward.
        </p>
      </div>
    </div>
  )
} 