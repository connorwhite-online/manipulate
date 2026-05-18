// Core hook
export { useHandRotation } from './useHandRotation'

// Components
export { HandCamera } from './HandCamera'
export { HandOverlay } from './HandOverlay'

// Utilities
export { applyDampedRotation } from './damping'
export { computeEulerFromHand } from './computeEulerFromHand'
export { lerpToOrigin } from './lerp'
export { createHandDetector, estimateHands } from './detector'

// Types
export type {
  Rotation,
  HandRotationConfig,
  HandRotationResult,
  Keypoint3D,
  DampingConfig,
} from './types'
export type { HandCameraProps } from './HandCamera'
export type { HandOverlayProps } from './HandOverlay'
export type { DetectorConfig, EstimationConfig } from './detector'
