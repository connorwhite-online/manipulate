"use client"

import React, { useState, forwardRef } from 'react';
import Webcam from 'react-webcam';
import Icon from './Icon';

interface CameraDisplayProps {
  mirrored?: boolean;
}

const CameraDisplay = forwardRef<Webcam, CameraDisplayProps>(({ mirrored = true }, ref) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="camera-container">
      {/* Camera is always rendered for hand tracking but hidden when collapsed */}
      <Webcam 
        ref={ref} 
        className="camera" 
        mirrored={mirrored} 
        style={{ 
          opacity: isExpanded ? 1 : 0,
          pointerEvents: isExpanded ? 'auto' : 'none',
          position: isExpanded ? 'static' : 'absolute',
          zIndex: isExpanded ? 'auto' : -1
        }} 
      />
      
      {isExpanded ? (
        // Expanded view with hover overlay
        <div 
          className="camera-expanded-overlay"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            className="camera-overlay" 
            style={{ opacity: isHovered ? 1 : 0 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            <Icon name="collapse" size={24} color="white" />
          </div>
        </div>
      ) : (
        // Collapsed view
        <div className="camera-collapsed-view" onClick={toggleExpanded}>
          <div className="camera-collapsed-content">
            <span className="camera-label">Camera</span>
            <Icon name="expand" size={20} color="white" />
          </div>
        </div>
      )}
    </div>
  );
});

CameraDisplay.displayName = 'CameraDisplay';

export default CameraDisplay; 