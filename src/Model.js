import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
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

  return (
    <group {...props} dispose={null} scale={0.075}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Caribiner.geometry}
        material={materials["Stainless Steel 17-4 PH"]}
        ref={mesh}
        // rotateX={0}
        // rotateY={0}
        // rotateZ={0}
      />
    </group>
  );
}

useGLTF.preload("/caribiner.glb");