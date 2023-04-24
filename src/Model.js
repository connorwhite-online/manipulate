import React from "react";
import { useGLTF } from "@react-three/drei";

export function Model(props) {
  const { nodes, materials } = useGLTF("/caribiner.glb");
  return (
    <group {...props} dispose={null} scale={0.075}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Caribiner.geometry}
        material={materials["Stainless Steel 17-4 PH"]}
      />
    </group>
  );
}

useGLTF.preload("/caribiner.glb");