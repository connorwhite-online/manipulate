import React from 'react';
import { Canvas } from '@react-three/fiber';
import Detection from './Detection'
import { Model } from './Model';
import './App.css';

function App() { 

  return (
    <div className='container'>
      <div className='webcam'>
        <Detection />
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