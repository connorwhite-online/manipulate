"use client"

import { useState, useRef, useEffect } from 'react'
import '@tensorflow/tfjs-backend-webgl'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import { Vector3, Matrix4, Euler, Quaternion } from 'three'

export default function useManipulation(cameraRef) {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })

  const model = handPoseDetection.SupportedModels.MediaPipeHands
  const detectorConfig = {
    runtime: 'tfjs',
    maxHands: 1,
    modelType: 'lite',
  }

  const detectorRef = useRef(null)
  const eulerRef = useRef(new Euler())
  const calibrationQuatRef = useRef(null)
  const currentHandednessRef = useRef(null)

  useEffect(() => {
    const runHandPose = async () => {
      const detector = await handPoseDetection.createDetector(model, detectorConfig)
      detectorRef.current = detector
    }
    runHandPose()
  }, [])

  const computeEulerFromHand = (keypoints3D, handedness) => {
    const getPoint = (i) => {
      const p = keypoints3D?.[i]
      if (!p) return null
      if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) return null
      return new Vector3(p.x, p.y, p.z)
    }

    // Indices per MediaPipe: 0=wrist, 5=index_mcp, 17=pinky_mcp
    const wrist = getPoint(0)
    const indexMCP = getPoint(5)
    const pinkyMCP = getPoint(17)

    if (!wrist || !indexMCP || !pinkyMCP) return null

    // Normalize axes so left/right hands yield a consistent local frame
    // For a right hand, x points wrist->index; for a left hand, x points wrist->pinky
    // u is the opposite side to form the palm plane; z is the palm normal via cross(x, u)
    let xAxis
    let u
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

    // Build rotation basis [xAxis, yAxis, zAxis]
    const m = new Matrix4()
    m.makeBasis(xAxis, yAxis, zAxis)

    // Convert to quaternion
    const q = new Quaternion().setFromRotationMatrix(m)

    // Initialize or compute relative to calibration
    if (!calibrationQuatRef.current) {
      calibrationQuatRef.current = q.clone()
      eulerRef.current.set(0, 0, 0, 'YXZ')
      return { x: 0, y: 0, z: 0 }
    }

    const invCalib = calibrationQuatRef.current.clone().invert()
    const qRel = q.clone().multiply(invCalib)

    const e = eulerRef.current.setFromQuaternion(qRel, 'YXZ')
    return { x: e.x, y: e.y, z: e.z }
  }

  const detect = async () => {
    if (!detectorRef.current) return
    if (
      typeof cameraRef.current === 'undefined' ||
      cameraRef.current === null ||
      !cameraRef.current.video ||
      cameraRef.current.video.readyState !== 4
    ) {
      // If camera not ready, clear calibration to re-baseline later
      calibrationQuatRef.current = null
      currentHandednessRef.current = null
      return
    }

    const video = cameraRef.current.video
    const videoWidth = video.videoWidth
    const videoHeight = video.videoHeight

    cameraRef.current.video.width = videoWidth
    cameraRef.current.video.height = videoHeight

    const estimationConfig = { flipHorizontal: true }
    const hands = await detectorRef.current.estimateHands(video, estimationConfig)

    const hand = hands?.[0]
    if (!hand) {
      // No hand detected; clear calibration to re-baseline on next detection
      calibrationQuatRef.current = null
      currentHandednessRef.current = null
      return
    }

    const handedness = hand.handedness || hand.handednesses?.[0]?.label || null

    // If handedness changed since last frame, reset calibration to avoid 180° flips
    if (handedness && handedness !== currentHandednessRef.current) {
      currentHandednessRef.current = handedness
      calibrationQuatRef.current = null
    }

    const keypoints3D = hand.keypoints3D
    if (Array.isArray(keypoints3D) && keypoints3D.length >= 18) {
      const rot = computeEulerFromHand(keypoints3D, handedness)
      if (rot) setRotation(rot)
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      detect()
    }, 100)
    return () => clearInterval(intervalId)
  }, [])

  return { rotation }
} 