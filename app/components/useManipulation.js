"use client"

import { useHandRotation } from '@manipulate/hand'

export default function useManipulation(cameraRef) {
  return useHandRotation(cameraRef, {
    maxHands: 1,
    modelType: 'lite',
    detectionInterval: 100,
    lerpDuration: 2000,
    flipHorizontal: true,
    axisInversion: { x: true, y: false, z: true },
  })
}
