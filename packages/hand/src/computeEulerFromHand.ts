import { Vector3, Matrix4, Euler, Quaternion } from 'three'
import type { Keypoint3D, Rotation } from './types'

/**
 * Computes Euler rotation angles from MediaPipe hand 3D keypoints.
 *
 * Uses wrist (0), index MCP (5), and pinky MCP (17) to build a local
 * coordinate frame representing the hand's orientation. Returns the
 * rotation relative to a calibration quaternion, or sets the calibration
 * on first call.
 */
export function computeEulerFromHand(
  keypoints3D: Keypoint3D[],
  handedness: string | null,
  calibrationQuat: Quaternion | null,
  euler: Euler,
): { rotation: Rotation; calibrationQuat: Quaternion } | null {
  const getPoint = (i: number): Vector3 | null => {
    const p = keypoints3D?.[i]
    if (!p) return null
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) return null
    return new Vector3(p.x, p.y, p.z)
  }

  // MediaPipe keypoint indices: 0=wrist, 5=index_mcp, 17=pinky_mcp
  const wrist = getPoint(0)
  const indexMCP = getPoint(5)
  const pinkyMCP = getPoint(17)

  if (!wrist || !indexMCP || !pinkyMCP) return null

  // Normalize axes so left/right hands yield a consistent local frame.
  // For a right hand, x points wrist->index; for a left hand, x points wrist->pinky.
  // u is the opposite side to form the palm plane; z is the palm normal via cross(x, u).
  let xAxis: Vector3
  let u: Vector3
  const isLeft = String(handedness || '').toLowerCase().startsWith('left')
  if (isLeft) {
    xAxis = pinkyMCP.clone().sub(wrist)
    u = indexMCP.clone().sub(wrist)
  } else {
    xAxis = indexMCP.clone().sub(wrist)
    u = pinkyMCP.clone().sub(wrist)
  }

  if (xAxis.lengthSq() < 1e-6 || u.lengthSq() < 1e-6) return null
  xAxis.normalize()
  u.normalize()

  const zAxis = new Vector3().crossVectors(xAxis, u)
  if (zAxis.lengthSq() < 1e-6) return null
  zAxis.normalize()

  const yAxis = new Vector3().crossVectors(zAxis, xAxis)
  if (yAxis.lengthSq() < 1e-6) return null
  yAxis.normalize()

  // Build rotation matrix from basis vectors
  const m = new Matrix4()
  m.makeBasis(xAxis, yAxis, zAxis)

  // Convert to quaternion
  const q = new Quaternion().setFromRotationMatrix(m)

  // On first detection, calibrate and return zero rotation
  if (!calibrationQuat) {
    euler.set(0, 0, 0, 'YXZ')
    return {
      rotation: { x: 0, y: 0, z: 0 },
      calibrationQuat: q.clone(),
    }
  }

  // Compute rotation relative to calibration pose
  const invCalib = calibrationQuat.clone().invert()
  const qRel = q.clone().multiply(invCalib)

  const e = euler.setFromQuaternion(qRel, 'YXZ')
  return {
    rotation: { x: e.x, y: e.y, z: e.z },
    calibrationQuat,
  }
}
