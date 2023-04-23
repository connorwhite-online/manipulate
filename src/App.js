import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Detection from './Detection'
import { Model } from './Model';
import Webcam from 'react-webcam';
import './App.css';

function App() { 

  const cameraRef = useRef(null);
  const { landmarks } = Detection(cameraRef);

  return (
    <div className='container'>
      <div className='webcam'>
      <Webcam 
        ref={cameraRef}
        // width={300} 
        style={{zIndex: 1, position: 'absolute'}}
        mirrored={true}
      />
      </div>
      <div className='webgl'>
        <Canvas style={{zIndex: 10}}>
          <ambientLight />
          <pointLight position={[3, 6, 1]} intensity={2}/>
          <pointLight position={[-5, -5, 1]} intensity={1}/>
          <Model />
        </Canvas>
      </div>
    </div>
  );
}

export default App;