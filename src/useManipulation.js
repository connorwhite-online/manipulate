import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import "@tensorflow/tfjs-backend-webgl";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

export default function useManipulation(cameraRef) {
  const [landmarks, setLandmarks] = useState([0, 0, 0]);

  // Configure the detector
  const model = handPoseDetection.SupportedModels.MediaPipeHands;
  const detectorConfig = useMemo(() => ({
    runtime: "tfjs",
    maxHands: 1,
    modelType: "lite",
  }), []);

  // Create a ref to store the detector
  const detectorRef = useRef(null);

  // Set up the detector
  useEffect(() => {
    const runHandPose = async () => {
      const detector = await handPoseDetection.createDetector(
        model,
        detectorConfig
      );
      detectorRef.current = detector;
      console.log("handpose model loaded");
    };
    runHandPose();
  }, [model, detectorConfig]);

  // Handpose detector function
  const detect = useCallback(async () => {
    if (
      typeof cameraRef.current !== "undefined" &&
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
      const estimationConfig = { flipHorizontal: true };
      const hands = await detectorRef.current.estimateHands(
        video,
        estimationConfig
      );

      // Get x, y, and z coordinates of landmarks
      const landmarks = hands[0].keypoints3D[0];
      setLandmarks(landmarks);
    }
  }, [cameraRef]);

  // Run detect function on an interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      detect();
    }, 100);
    return () => clearInterval(intervalId);
  }, [detect]);

  return { landmarks };
}
