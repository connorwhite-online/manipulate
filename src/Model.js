import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function Model(landmarks) {
  const { nodes, materials } = useGLTF("/m1_metal.gltf");
  const meshRef = useRef();


  return (
    <group ref={meshRef} dispose={null}>
      <group scale={1}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["64765"].geometry}
          material={materials.Material_2}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes["64765_1"].geometry}
          material={materials.Material_3}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/m1_metal.gltf");