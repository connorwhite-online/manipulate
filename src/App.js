import './App.css';
import React, { useEffect, useRef } from "react";
// import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import { Canvas } from "@react-three/fiber";

export default function App() {
  const boxRef = useRef();
  const webcamRef = useRef(null);

  useEffect(() => {
    async function setupHandpose() {
      const model = await handpose.load();
      const video = webcamRef.current.video;

      const detectHands = async () => {
        const predictions = await model.estimateHands(video);
        if (predictions.length > 0) {
          // Get the coordinates of the first hand landmark
          const [x, y, z] = predictions[0].landmarks[0];
          // Use the coordinates to update the 3D model position
          boxRef.current.position.set(x, y, z);
        }
      };

      setInterval(detectHands, 100);
    }
    setupHandpose();
  }, []);

  return (
    <div className="container">
      <Webcam ref={webcamRef} width={900} height={500}/>
      <div className="box" >
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <boxGeometry ref={boxRef}/>
        <meshBasicMaterial color="hotpink" />
      </Canvas>
      </div>
    </div>
  );
}