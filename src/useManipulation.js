import { useState, useRef, useEffect } from "react";
import "@tensorflow/tfjs-backend-webgl";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

export default function useManipulation(cameraRef) {
  const [landmarks, setLandmarks] = useState({ x: 0, y: 0, z: 0 });
  const [isDetectorReady, setIsDetectorReady] = useState(false);

  // Configure the detector
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: "tfjs",
    maxHands: 1,
    modelType: "lite",
  };

  // Create a ref to store the detector
  const detectorRef = useRef(null);

  // Set up the detector
  useEffect(() => {
    const runHandPose = async () => {
      try {
        const detector = await handPoseDetection.createDetector(
          model,
          detectorConfig
        );
        detectorRef.current = detector;
        setIsDetectorReady(true);
        console.log("handpose model loaded");
      } catch (error) {
        console.error("Failed to load handpose model:", error);
      }
    };
    runHandPose();
  }, []);

  // Handpose detector function
  const detect = async () => {
    if (
      !detectorRef.current ||
      !isDetectorReady ||
      typeof cameraRef.current === "undefined" ||
      cameraRef.current === null ||
      cameraRef.current.video.readyState !== 4
    ) {
      return;
    }

    try {
      // Video Properties
      const video = cameraRef.current.video;
      const videoWidth = cameraRef.current.video.videoWidth;
      const videoHeight = cameraRef.current.video.videoHeight;

      // Set video width
      cameraRef.current.video.width = videoWidth;
      cameraRef.current.video.height = videoHeight;

      // Make Detections
      const estimationConfig = { flipHorizontal: true };
      const hands = await detectorRef.current.estimateHands(
        video,
        estimationConfig
      );

      // Get x, y, and z coordinates of landmarks
      if (hands && hands.length > 0 && hands[0].keypoints3D && hands[0].keypoints3D.length > 0) {
        const landmarks = hands[0].keypoints3D[0];
        setLandmarks(landmarks);
      }
    } catch (error) {
      console.error("Detection error:", error);
    }
  };

  // Run detect function on an interval, but only after detector is ready
  useEffect(() => {
    if (!isDetectorReady) return;

    const intervalId = setInterval(() => {
      detect();
    }, 100);
    
    return () => clearInterval(intervalId);
  }, [isDetectorReady]); // Only start interval when detector is ready

  return { landmarks };
}
