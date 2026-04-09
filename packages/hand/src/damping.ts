import { dampE } from 'maath/easing'
import type { Euler } from 'three'
import type { Rotation, DampingConfig } from './types'

const DEFAULTS: Required<DampingConfig> = {
  smoothTime: 0.25,
  minDelta: 0.001,
  maxDelta: 0.05,
}

/**
 * Applies damped rotation to a Three.js object's rotation.
 * Call this inside a useFrame callback.
 *
 * @param objectRotation - The target object's `.rotation` (a Three.js Euler)
 * @param targetRotation - The desired rotation from useHandRotation
 * @param delta - Frame delta time from useFrame
 * @param config - Optional damping parameters
 */
export function applyDampedRotation(
  objectRotation: Euler,
  targetRotation: Rotation,
  delta: number,
  config?: DampingConfig,
): void {
  const { x, y, z } = targetRotation
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return

  const cfg = { ...DEFAULTS, ...config }
  const clampedDelta = Math.min(Math.max(delta, cfg.minDelta), cfg.maxDelta)
  dampE(objectRotation, [x, y, z], cfg.smoothTime, clampedDelta)
}
