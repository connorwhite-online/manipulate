import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Model } from './Model';
import { OrbitControls } from '@react-three/drei';
import Webcam from 'react-webcam';
import './scene.css';
import useManipulation from './useManipulation';

export default function Scene() {

    const modelRef = useRef();
    const cameraRef = useRef(null);
    const landmarks = useManipulation(cameraRef);

    console.log(landmarks)

    // useFrame(() => {
    //     if (landmarks) {
    //       const { x, y, z } = landmarks;
    //       modelRef.current.rotation.x = x;
    //       modelRef.current.rotation.y = y;
    //       modelRef.current.rotation.z = z;
    //     }
    //   });

    return(
        <div className='container'>
            <div className='webgl'>
                <Canvas style={{zIndex: 10}} >
                    <ambientLight />
                    <pointLight position={[1, 0, -3]} intensity={1} color={'white'}/>
                    <pointLight position={[-1, 0, 3]} intensity={1} color={'white'}/>
                    <pointLight position={[3, 6, 1]} intensity={.5} color={'#FF7474'}/>
                    <pointLight position={[-5, -5, 1]} intensity={.5} color={'#82CAFF'}/>
                    <Model ref={modelRef}/>
                    <OrbitControls />
                </Canvas>
            </div>
            <div className='camera'>
                <Webcam 
                    ref={cameraRef}
                    // width={300} 
                    style={{zIndex: 1, position: 'absolute'}}
                    mirrored={true}
                />
            </div>
        </div>
    )
}