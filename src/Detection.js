// import React, { useRef } from "react";
import '@tensorflow/tfjs-backend-webgl';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';


export default function Detection(cameraRef) {

    // Configure the detector
    const model = handPoseDetection.SupportedModels.MediaPipeHands;
    const detectorConfig = {
        runtime: 'tfjs',
        maxHands: 1,
        modelType: 'lite',
    };

    // Create the detector
    const runHandPose = async () => {
        const net = await handPoseDetection.createDetector(model, detectorConfig);
        console.log("handpose model loaded");

        setInterval(() => {
        detect(net);
        }, 100);
    };

    // Handpose detector function
    const detect = async (net) => {

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

        // Make Detections
        const estimationConfig = {flipHorizontal: true};
        const hands = await net.estimateHands(video, estimationConfig);
        // console.log(hands[0].keypoints3D[0], hands[0].score, hands[0].handedness);

        // Get x, y, and z coordinates of landmarks
        const landmarks = hands[0].keypoints3D[0]
        console.log(landmarks)
        }
    };

    

    runHandPose();

    return(cameraRef)
}
