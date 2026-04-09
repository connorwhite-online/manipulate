import type { Rotation } from './types'

/**
 * Computes a lerped rotation value easing back toward the origin (0,0,0).
 * Uses cubic ease-out for smooth deceleration.
 *
 * Returns the interpolated rotation and whether the animation is complete.
 */
export function lerpToOrigin(
  startRotation: Rotation,
  startTime: number,
  currentTime: number,
  duration: number,
): { rotation: Rotation; complete: boolean } {
  const elapsed = currentTime - startTime
  const progress = Math.min(elapsed / duration, 1)

  // Cubic ease-out: 1 - (1 - t)^3
  const easedProgress = 1 - Math.pow(1 - progress, 3)

  return {
    rotation: {
      x: startRotation.x * (1 - easedProgress),
      y: startRotation.y * (1 - easedProgress),
      z: startRotation.z * (1 - easedProgress),
    },
    complete: progress >= 1,
  }
}
