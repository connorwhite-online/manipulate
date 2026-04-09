export interface Rotation {
  x: number
  y: number
  z: number
}

export interface HandRotationConfig {
  /** Maximum number of hands to detect (default: 1) */
  maxHands?: number
  /** MediaPipe model type: 'lite' or 'full' (default: 'lite') */
  modelType?: 'lite' | 'full'
  /** Detection interval in ms (default: 100) */
  detectionInterval?: number
  /** Duration in ms to lerp back to origin when hand is lost (default: 2000) */
  lerpDuration?: number
  /** Whether to flip the video horizontally for mirror effect (default: true) */
  flipHorizontal?: boolean
  /** Axis inversion for natural control feel. Each key flips that axis. (default: { x: true, y: false, z: true }) */
  axisInversion?: {
    x?: boolean
    y?: boolean
    z?: boolean
  }
}

export interface HandRotationResult {
  /** Current rotation Euler angles */
  rotation: Rotation
  /** Whether a hand is currently detected */
  handDetected: boolean
}

export interface Keypoint3D {
  x: number
  y: number
  z: number
}

export interface DampingConfig {
  /** Smoothing factor: 0 = instant, higher = slower. (default: 0.25) */
  smoothTime?: number
  /** Minimum delta time to prevent jitter (default: 0.001) */
  minDelta?: number
  /** Maximum delta time to prevent large jumps (default: 0.05) */
  maxDelta?: number
}
