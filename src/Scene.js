import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Model } from './Model';
import Webcam from 'react-webcam';
import './scene.css';
import useManipulation from './useManipulation';
import { Perf } from 'r3f-perf';

export default function Scene() {

    const modelRef = useRef();
    const cameraRef = useRef(null);
    const { landmarks } = useManipulation(cameraRef);

    console.log(landmarks)

    return(
        <div className='container'>
            <div className='webgl'>
                <Canvas style={{zIndex: 10}} >
                    <Perf />
                    <ambientLight />
                    <pointLight position={[1, 0, -3]} intensity={1} color={'white'}/>
                    <pointLight position={[-1, 0, 3]} intensity={1} color={'white'}/>
                    <pointLight position={[3, 6, 1]} intensity={.5} color={'#FF7474'}/>
                    <pointLight position={[-5, -5, 1]} intensity={.5} color={'#82CAFF'}/>
                    <Model ref={modelRef} landmarks={landmarks}/>
                </Canvas>
            </div>
            <Webcam 
                ref={cameraRef}
                className='camera'
                mirrored={true}
            />
        </div>
    )
}