import React, { useRef, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export function Model(props) {
  const { nodes, materials } = useGLTF("/caribiner.glb");
  const mesh = useRef();
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  useFrame(() => {
    if (props.landmarks) {
      const { x, y, z } = props.landmarks;
      setRotation((prevRotation) => ({
        x: prevRotation.x + (x - prevRotation.x) * 0.1,
        y: prevRotation.y + (y - prevRotation.y) * 0.1,
        z: prevRotation.z + (z - prevRotation.z) * 0.1,
      }));
      mesh.current.rotation.x = rotation.x * 20;
      mesh.current.rotation.y = rotation.y * 100;
      mesh.current.rotation.z = rotation.z * 20;
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