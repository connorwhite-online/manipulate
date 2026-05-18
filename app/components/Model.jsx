"use client"

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { applyDampedRotation } from '@manipulate/hand'

export function Model(props) {
  const { nodes, materials } = useGLTF('/caribiner.glb')
  const mesh = useRef()

  useFrame((state, delta) => {
    if (!mesh.current || !props.rotationEuler) return
    applyDampedRotation(mesh.current.rotation, props.rotationEuler, delta)
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
