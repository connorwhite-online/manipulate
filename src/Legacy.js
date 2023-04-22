import React, { useRef } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
// import * as tf from '@tensorflow/tfjs-core';
// Register WebGL backend.
import '@tensorflow/tfjs-backend-webgl';
import { Canvas } from '@react-three/fiber';
import Webcam from 'react-webcam';
// import { drawHand } from './utilities';
import './App.css';
import { Model } from './Model';

function App() {

  const modelRef = useRef();
  const cameraRef = useRef();
  // const canvasRef = useRef();

  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: 'tfjs',
    maxHands: 1,
    modelType: 'lite',
  };

  // Create the detector
  const runHandPose = async () => {
    const detector = await handPoseDetection.createDetector(model, detectorConfig);
    console.log("handpose model loaded");

    setInterval(() => {
      detect(detector);
    }, 100);
  };

  const detect = async (detector) => {

    if (
      typeof cameraRef.current !== 'undefined' &&
      cameraRef.current !== null &&
      cameraRef.current.video.readyState === 4
    ) {
      // Video Properties
      const video = cameraRef.current.video;
      const videoWidth = cameraRef.current.video.videoWidth;
      const videoHeight = cameraRef.current.video.videoHeight;

      // Set video width
      cameraRef.current.video.width = videoWidth;
      cameraRef.current.video.height = videoHeight;

      // Set canvas width & height
      // canvasRef.current.width = videoWidth;
      // canvasRef.current.height = videoHeight;

      // Make Detections
      const estimationConfig = {flipHorizontal: true};
      const hands = await detector.estimateHands(video, estimationConfig);
      console.log(hands[0].keypoints3D[4]);

      // Draw Hand Mesh
      // const ctx = canvasRef.current.getContext('2d');
      // drawHand(hands, ctx);
    }
  };

  runHandPose();

  // useFrame hook to link Model rotation to the 3D keypoints of the hands detected  

  return (
    <div className='container'>
      <div className='webcam'>
        <Webcam
          ref={cameraRef}
          width={100} 
          style={{zIndex: 1, position: 'absolute'}}
        />
        {/* <canvas ref={canvasRef} width={300} style={{position: 'absolute', zIndex: 3}} /> */}
      </div>
      <div className='webgl'>
        <Canvas style={{zIndex: 10}}>
          <ambientLight />
          <pointLight position={[3, 6, 1]} intensity={2}/>
          <pointLight position={[-5, -5, 1]} intensity={1}/>
          <Model ref={modelRef} rotation={[0, Math.PI/3.25,  0]} />
        </Canvas>
      </div>
    </div>
  );
}

export default App;