import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { dampE } from "maath/easing";

export function Model(props) {
  const { nodes, materials } = useGLTF("/caribiner.glb");
  const mesh = useRef();

  // Rotating the model based on 3D landmarks using a smoothing function
  useFrame((state, delta) => {
    if (props.landmarks) {
      const { x, y, z } = props.landmarks;
      dampE(mesh.current.rotation, [x * 25, y * 100, z * 25], 0.25, delta)
    }
  });

  // useFrame(() => {
  //   if (props.landmarks) {
  //     const { x, y, z } = props.landmarks;
  //     mesh.current.rotation.x = x * 25;
  //     mesh.current.rotation.y = y * 100;
  //     mesh.current.rotation.z = z * 25;
  //   }
  // })

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