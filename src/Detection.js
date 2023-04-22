import React, { useRef } from "react";
import '@tensorflow/tfjs-backend-webgl';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import Webcam from 'react-webcam';


export default function Detection(props) {

    const cameraRef = useRef(null);

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

    return(
        <div className="detection">
            <Webcam 
                ref={cameraRef}
                width={300} 
                style={{zIndex: 1, position: 'absolute'}}
            />
            {/* <canvas 
                ref={canvasRef} 
                width={300} 
                style={{position: 'absolute', zIndex: 3}} 
            /> */}
        </div>
    )
}
