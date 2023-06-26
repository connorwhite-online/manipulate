import React, { useEffect, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { dampE } from "maath/easing";

export function Model(props) {
  const { nodes, materials } = useGLTF("/caribiner.glb");
  const mesh = useRef();

  // Set initial rotation for the mesh
  // useEffect(() => {
  //   if (props.landmarks) {
  //     mesh.current.rotation.set(0, 0, 0);
  //   }
  // }, [props.landmarks]);

  // Rotating the model based on 3D landmarks using a smoothing function
  useFrame((state, delta) => {
    if (props.landmarks) {
      const { x, y, z } = props.landmarks;
      dampE(mesh.current.rotation, [x * 25, y * 100, z * 25], 0.25, delta)
    }
  });

  return (
    <group {...props} dispose={null} >
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