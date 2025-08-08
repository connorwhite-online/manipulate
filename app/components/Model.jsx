"use client"

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { dampE } from 'maath/easing'

export function Model(props) {
  const { nodes, materials } = useGLTF('/caribiner.glb')
  const mesh = useRef()

  useFrame((state, delta) => {
    if (!mesh.current || !props.rotationEuler) return
    const { x, y, z } = props.rotationEuler
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return
    const clampedDelta = Math.min(Math.max(delta, 0.001), 0.05)
    dampE(mesh.current.rotation, [x, y, z], 0.25, clampedDelta)
  })

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Caribiner?.geometry}
        material={materials['Stainless Steel 17-4 PH']}
        ref={mesh}
      />
    </group>
  )
}

useGLTF.preload('/caribiner.glb') 