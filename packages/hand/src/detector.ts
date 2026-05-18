import '@tensorflow/tfjs-backend-webgl'
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'

export interface DetectorConfig {
  maxHands?: number
  modelType?: 'lite' | 'full'
}

export interface EstimationConfig {
  flipHorizontal?: boolean
}

/**
 * Creates and returns a MediaPipe hand pose detector.
 */
export async function createHandDetector(
  config: DetectorConfig = {},
): Promise<handPoseDetection.HandDetector> {
  const model = handPoseDetection.SupportedModels.MediaPipeHands
  const detectorConfig: handPoseDetection.MediaPipeHandsTfjsModelConfig = {
    runtime: 'tfjs' as const,
    maxHands: config.maxHands ?? 1,
    modelType: config.modelType ?? 'lite',
  }
  return handPoseDetection.createDetector(model, detectorConfig)
}

/**
 * Estimates hands from a video element.
 */
export async function estimateHands(
  detector: handPoseDetection.HandDetector,
  video: HTMLVideoElement,
  config: EstimationConfig = {},
) {
  return detector.estimateHands(video, {
    flipHorizontal: config.flipHorizontal ?? true,
  })
}
