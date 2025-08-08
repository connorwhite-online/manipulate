"use client"

import React, { useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Model } from './Model'
import Webcam from 'react-webcam'
import useManipulation from './useManipulation'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'

export default function Scene() {
  const modelRef = useRef()
  const cameraRef = useRef(null)
  const { rotation } = useManipulation(cameraRef)

  // Align perceived axes: keep Y as-is, flip X and Z to match expected control direction
  const adjustedRotation = { x: -rotation.x, y: rotation.y, z: -rotation.z }

  return (
    <div className='container'>
      <div className='webgl' style={{ position: 'absolute', inset: 0 }}>
        <Canvas shadows style={{ width: '100vw', height: '100vh', zIndex: 10 }} gl={{ toneMappingExposure: 1.15 }}>
          <ambientLight intensity={0.05} />
          <Suspense fallback={null}>
            <Model ref={modelRef} rotationEuler={adjustedRotation} />
          </Suspense>
          <Environment resolution={512}>
            <Lightformer form="rect" intensity={4} position={[0, 5, 2]} rotation={[-Math.PI / 2.5, 0, 0]} scale={[8, 6, 1]} />
            <Lightformer form="rect" intensity={3} position={[-5, 2, -2]} rotation={[0, Math.PI / 2, 0]} scale={[2.5, 4, 1]} />
            <Lightformer form="rect" intensity={3} position={[5, 2, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[2.5, 4, 1]} />
            <Lightformer form="ring" intensity={2} position={[0, 0.5, -6]} scale={[3.5, 3.5, 1]} />
          </Environment>
          <ContactShadows position={[0, -0.001, 0]} opacity={0.6} scale={10} blur={2} far={10} />
          {/* Axes helper at the world origin, size 1.5 */}
          <axesHelper args={[1.5]} />
        </Canvas>
      </div>
      <Webcam ref={cameraRef} className='camera' mirrored={true} />
    </div>
  )
} 