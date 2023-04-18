import React, { useRef } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import { Canvas } from '@react-three/fiber';
import Webcam from 'react-webcam';
import './App.css';

function App() {

  const modelRef = useRef();
  const cameraRef = useRef();

  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: 'tfjs',
    maxHands: 1,
    modelType: 'lite',
  };
  detector = await handPoseDetection.createDetector(model, detectorConfig);

  const estimationConfig = {flipHorizontal: true};
  const hands = await detector.estimateHands(Webcam, estimationConfig);

  return (
    <div className='container'>
      <div className='webcam'>
        <Webcam
        ref={cameraRef}
        width={300} />
      </div>
      <div className='webgl'>
        <Canvas >
        <ambientLight />
          <mesh ref={modelRef} rotation={[0, -Math.PI / 1.5, Math.PI / 1.25]}>
            <boxBufferGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="hotpink" />
          </mesh>
        </Canvas>
      </div>
    </div>
  );
}

export default App;