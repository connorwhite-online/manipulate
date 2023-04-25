import React, { useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export function Model(props) {
  const { nodes, materials } = useGLTF("/caribiner.glb");
  const mesh = useRef();
  // const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  useFrame(() => {
    if (props.landmarks) {
      const { x, y, z } = props.landmarks;
      mesh.current.rotation.x = x * 20;
      mesh.current.rotation.y = y * 100;
      mesh.current.rotation.z = z * 20;
    }
  });

  return (
    <group {...props} dispose={null} scale={0.075}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Caribiner.geometry}
        material={materials["Stainless Steel 17-4 PH"]}
        ref={mesh}
      />
    </group>
  );
}

useGLTF.preload("/caribiner.glb");