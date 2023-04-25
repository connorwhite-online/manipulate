import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { dampE } from "maath/easing";

export function Model(props) {
  const { nodes, materials } = useGLTF("/caribiner.glb");
  const mesh = useRef();
  const { clock } = useThree();

  useFrame(() => {
    if (props.landmarks) {
      const { x, y, z } = props.landmarks;
      dampE(mesh.current.rotation, [x, y, z], 0.25, clock.getDelta())
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