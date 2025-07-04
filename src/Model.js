import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { dampE } from "maath/easing";

export function Model(props) {
  const mesh = useRef();

  // Rotating the model based on 3D landmarks using a smoothing function
  useFrame((state, delta) => {
    if (props.landmarks && mesh.current) {
      const { x, y, z } = props.landmarks;
      // Apply smooth rotation based on hand landmarks
      dampE(mesh.current.rotation, [x * 25, y * 100, z * 25], 0.25, delta);
    }
  });

  return (
    <group {...props} dispose={null}>
      <mesh
        ref={mesh}
        castShadow
        receiveShadow
      >
        {/* Simple square geometry instead of heavy GLTF model */}
        <boxGeometry args={[2, 2, 0.2]} />
        <meshStandardMaterial 
          color="#ff6b6b" 
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}