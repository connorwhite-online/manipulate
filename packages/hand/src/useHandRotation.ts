import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Euler, Quaternion } from 'three'
import type * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import { createHandDetector, estimateHands } from './detector'
import { computeEulerFromHand } from './computeEulerFromHand'
import { lerpToOrigin } from './lerp'
import type { Rotation, HandRotationConfig, HandRotationResult } from './types'

const DEFAULT_CONFIG: Required<HandRotationConfig> = {
  maxHands: 1,
  modelType: 'lite',
  detectionInterval: 100,
  lerpDuration: 2000,
  flipHorizontal: true,
  axisInversion: { x: true, y: false, z: true },
}

/**
 * React hook that converts hand pose detection from a webcam into
 * 3D rotation Euler angles. Point a camera ref at a react-webcam
 * instance and this hook returns smoothly updating rotation values.
 *
 * @param cameraRef - Ref to a react-webcam instance
 * @param config - Optional configuration
 * @returns rotation (Euler angles) and handDetected flag
 */
export function useHandRotation(
  cameraRef: React.RefObject<{ video: HTMLVideoElement | null } | null>,
  config?: HandRotationConfig,
): HandRotationResult {
  const cfg = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [
    config?.maxHands,
    config?.modelType,
    config?.detectionInterval,
    config?.lerpDuration,
    config?.flipHorizontal,
    config?.axisInversion?.x,
    config?.axisInversion?.y,
    config?.axisInversion?.z,
  ])

  const [rotation, setRotation] = useState<Rotation>({ x: 0, y: 0, z: 0 })
  const [handDetected, setHandDetected] = useState(false)

  const detectorRef = useRef<handPoseDetection.HandDetector | null>(null)
  const eulerRef = useRef(new Euler())
  const calibrationQuatRef = useRef<Quaternion | null>(null)
  const currentHandednessRef = useRef<string | null>(null)
  const lerpStartTimeRef = useRef<number | null>(null)
  const lerpStartRotationRef = useRef<Rotation>({ x: 0, y: 0, z: 0 })
  const handDetectedRef = useRef(false)
  const rotationRef = useRef<Rotation>({ x: 0, y: 0, z: 0 })

  // Keep refs in sync with state for use in the detection callback
  useEffect(() => {
    handDetectedRef.current = handDetected
  }, [handDetected])

  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  // Initialize hand detector
  useEffect(() => {
    let disposed = false
    createHandDetector({
      maxHands: cfg.maxHands,
      modelType: cfg.modelType,
    }).then((detector) => {
      if (!disposed) {
        detectorRef.current = detector
      }
    })
    return () => {
      disposed = true
      detectorRef.current = null
    }
  }, [cfg.maxHands, cfg.modelType])

  const detect = useCallback(async () => {
    if (!detectorRef.current) return

    const cam = cameraRef.current
    if (!cam || !cam.video || cam.video.readyState !== 4) {
      calibrationQuatRef.current = null
      currentHandednessRef.current = null
      setHandDetected(false)
      return
    }

    const video = cam.video
    video.width = video.videoWidth
    video.height = video.videoHeight

    const hands = await estimateHands(detectorRef.current, video, {
      flipHorizontal: cfg.flipHorizontal,
    })

    const hand = hands?.[0]
    if (!hand) {
      // No hand — start lerping back to origin
      if (handDetectedRef.current) {
        setHandDetected(false)
        lerpStartTimeRef.current = null
      }

      if (!lerpStartTimeRef.current) {
        lerpStartTimeRef.current = performance.now()
        lerpStartRotationRef.current = { ...rotationRef.current }
      }

      const { rotation: lerpedRotation, complete } = lerpToOrigin(
        lerpStartRotationRef.current,
        lerpStartTimeRef.current,
        performance.now(),
        cfg.lerpDuration,
      )

      setRotation(lerpedRotation)

      if (complete) {
        calibrationQuatRef.current = null
        currentHandednessRef.current = null
      }
      return
    }

    // Hand detected
    if (!handDetectedRef.current) {
      setHandDetected(true)
      lerpStartTimeRef.current = null
    }

    const handedness = (hand as any).handedness ?? (hand as any).handednesses?.[0]?.label ?? null

    // Reset calibration on handedness change to avoid 180 degree flips
    if (handedness && handedness !== currentHandednessRef.current) {
      currentHandednessRef.current = handedness
      calibrationQuatRef.current = null
    }

    const keypoints3D = (hand as any).keypoints3D
    if (Array.isArray(keypoints3D) && keypoints3D.length >= 18) {
      const result = computeEulerFromHand(
        keypoints3D,
        handedness,
        calibrationQuatRef.current,
        eulerRef.current,
      )
      if (result) {
        calibrationQuatRef.current = result.calibrationQuat
        const inv = cfg.axisInversion
        setRotation({
          x: inv.x ? -result.rotation.x : result.rotation.x,
          y: inv.y ? -result.rotation.y : result.rotation.y,
          z: inv.z ? -result.rotation.z : result.rotation.z,
        })
      }
    }
  }, [cameraRef, cfg.flipHorizontal, cfg.lerpDuration, cfg.axisInversion])

  // Detection loop
  useEffect(() => {
    const intervalId = setInterval(() => {
      detect()
    }, cfg.detectionInterval)
    return () => clearInterval(intervalId)
  }, [detect, cfg.detectionInterval])

  return { rotation, handDetected }
}
