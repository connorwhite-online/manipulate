import React$1 from 'react';
import Webcam from 'react-webcam';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { Euler, Quaternion } from 'three';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';

interface Rotation {
    x: number;
    y: number;
    z: number;
}
interface HandRotationConfig {
    /** Maximum number of hands to detect (default: 1) */
    maxHands?: number;
    /** MediaPipe model type: 'lite' or 'full' (default: 'lite') */
    modelType?: 'lite' | 'full';
    /** Detection interval in ms (default: 100) */
    detectionInterval?: number;
    /** Duration in ms to lerp back to origin when hand is lost (default: 2000) */
    lerpDuration?: number;
    /** Whether to flip the video horizontally for mirror effect (default: true) */
    flipHorizontal?: boolean;
    /** Axis inversion for natural control feel. Each key flips that axis. (default: { x: true, y: false, z: true }) */
    axisInversion?: {
        x?: boolean;
        y?: boolean;
        z?: boolean;
    };
}
interface HandRotationResult {
    /** Current rotation Euler angles */
    rotation: Rotation;
    /** Whether a hand is currently detected */
    handDetected: boolean;
}
interface Keypoint3D {
    x: number;
    y: number;
    z: number;
}
interface DampingConfig {
    /** Smoothing factor: 0 = instant, higher = slower. (default: 0.25) */
    smoothTime?: number;
    /** Minimum delta time to prevent jitter (default: 0.001) */
    minDelta?: number;
    /** Maximum delta time to prevent large jumps (default: 0.05) */
    maxDelta?: number;
}

/**
 * React hook that converts hand pose detection from a webcam into
 * 3D rotation Euler angles. Point a camera ref at a react-webcam
 * instance and this hook returns smoothly updating rotation values.
 *
 * @param cameraRef - Ref to a react-webcam instance
 * @param config - Optional configuration
 * @returns rotation (Euler angles) and handDetected flag
 */
declare function useHandRotation(cameraRef: React.RefObject<{
    video: HTMLVideoElement | null;
} | null>, config?: HandRotationConfig): HandRotationResult;

interface HandCameraProps {
    /** Mirror the video feed (default: true) */
    mirrored?: boolean;
    /** CSS class for the outer container */
    className?: string;
    /** Whether the camera starts expanded (default: true) */
    defaultExpanded?: boolean;
    /** Label shown when collapsed (default: 'Camera') */
    collapsedLabel?: string;
    /** Render prop for the collapse button content */
    collapseIcon?: React$1.ReactNode;
    /** Render prop for the expand button content */
    expandIcon?: React$1.ReactNode;
}
/**
 * Drop-in webcam display component with collapse/expand functionality.
 * Forward a ref to access the underlying Webcam instance for hand detection.
 */
declare const HandCamera: React$1.ForwardRefExoticComponent<HandCameraProps & React$1.RefAttributes<Webcam>>;

interface HandOverlayProps {
    /** Whether the overlay is visible */
    visible: boolean;
    /** Custom message to display */
    message?: string;
    /** CSS class for the outer container */
    className?: string;
    /** Custom content to render instead of the default message */
    children?: React$1.ReactNode;
}
/**
 * Overlay hint that prompts the user to show their hand to the camera.
 * Shown when no hand is detected.
 */
declare function HandOverlay({ visible, message, className, children, }: HandOverlayProps): react_jsx_runtime.JSX.Element | null;

/**
 * Applies damped rotation to a Three.js object's rotation.
 * Call this inside a useFrame callback.
 *
 * @param objectRotation - The target object's `.rotation` (a Three.js Euler)
 * @param targetRotation - The desired rotation from useHandRotation
 * @param delta - Frame delta time from useFrame
 * @param config - Optional damping parameters
 */
declare function applyDampedRotation(objectRotation: Euler, targetRotation: Rotation, delta: number, config?: DampingConfig): void;

/**
 * Computes Euler rotation angles from MediaPipe hand 3D keypoints.
 *
 * Uses wrist (0), index MCP (5), and pinky MCP (17) to build a local
 * coordinate frame representing the hand's orientation. Returns the
 * rotation relative to a calibration quaternion, or sets the calibration
 * on first call.
 */
declare function computeEulerFromHand(keypoints3D: Keypoint3D[], handedness: string | null, calibrationQuat: Quaternion | null, euler: Euler): {
    rotation: Rotation;
    calibrationQuat: Quaternion;
} | null;

/**
 * Computes a lerped rotation value easing back toward the origin (0,0,0).
 * Uses cubic ease-out for smooth deceleration.
 *
 * Returns the interpolated rotation and whether the animation is complete.
 */
declare function lerpToOrigin(startRotation: Rotation, startTime: number, currentTime: number, duration: number): {
    rotation: Rotation;
    complete: boolean;
};

interface DetectorConfig {
    maxHands?: number;
    modelType?: 'lite' | 'full';
}
interface EstimationConfig {
    flipHorizontal?: boolean;
}
/**
 * Creates and returns a MediaPipe hand pose detector.
 */
declare function createHandDetector(config?: DetectorConfig): Promise<handPoseDetection.HandDetector>;
/**
 * Estimates hands from a video element.
 */
declare function estimateHands(detector: handPoseDetection.HandDetector, video: HTMLVideoElement, config?: EstimationConfig): Promise<handPoseDetection.Hand[]>;

export { type DampingConfig, type DetectorConfig, type EstimationConfig, HandCamera, type HandCameraProps, HandOverlay, type HandOverlayProps, type HandRotationConfig, type HandRotationResult, type Keypoint3D, type Rotation, applyDampedRotation, computeEulerFromHand, createHandDetector, estimateHands, lerpToOrigin, useHandRotation };
