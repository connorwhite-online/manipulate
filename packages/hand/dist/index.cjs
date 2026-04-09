'use strict';

var react = require('react');
var three = require('three');
require('@tensorflow/tfjs-backend-webgl');
var handPoseDetection = require('@tensorflow-models/hand-pose-detection');
var Webcam = require('react-webcam');
var jsxRuntime = require('react/jsx-runtime');
var easing = require('maath/easing');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var handPoseDetection__namespace = /*#__PURE__*/_interopNamespace(handPoseDetection);
var Webcam__default = /*#__PURE__*/_interopDefault(Webcam);

// src/useHandRotation.ts
async function createHandDetector(config = {}) {
  const model = handPoseDetection__namespace.SupportedModels.MediaPipeHands;
  const detectorConfig = {
    runtime: "tfjs",
    maxHands: config.maxHands ?? 1,
    modelType: config.modelType ?? "lite"
  };
  return handPoseDetection__namespace.createDetector(model, detectorConfig);
}
async function estimateHands(detector, video, config = {}) {
  return detector.estimateHands(video, {
    flipHorizontal: config.flipHorizontal ?? true
  });
}
function computeEulerFromHand(keypoints3D, handedness, calibrationQuat, euler) {
  const getPoint = (i) => {
    const p = keypoints3D?.[i];
    if (!p) return null;
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.z)) return null;
    return new three.Vector3(p.x, p.y, p.z);
  };
  const wrist = getPoint(0);
  const indexMCP = getPoint(5);
  const pinkyMCP = getPoint(17);
  if (!wrist || !indexMCP || !pinkyMCP) return null;
  let xAxis;
  let u;
  const isLeft = String(handedness || "").toLowerCase().startsWith("left");
  if (isLeft) {
    xAxis = pinkyMCP.clone().sub(wrist);
    u = indexMCP.clone().sub(wrist);
  } else {
    xAxis = indexMCP.clone().sub(wrist);
    u = pinkyMCP.clone().sub(wrist);
  }
  if (xAxis.lengthSq() < 1e-6 || u.lengthSq() < 1e-6) return null;
  xAxis.normalize();
  u.normalize();
  const zAxis = new three.Vector3().crossVectors(xAxis, u);
  if (zAxis.lengthSq() < 1e-6) return null;
  zAxis.normalize();
  const yAxis = new three.Vector3().crossVectors(zAxis, xAxis);
  if (yAxis.lengthSq() < 1e-6) return null;
  yAxis.normalize();
  const m = new three.Matrix4();
  m.makeBasis(xAxis, yAxis, zAxis);
  const q = new three.Quaternion().setFromRotationMatrix(m);
  if (!calibrationQuat) {
    euler.set(0, 0, 0, "YXZ");
    return {
      rotation: { x: 0, y: 0, z: 0 },
      calibrationQuat: q.clone()
    };
  }
  const invCalib = calibrationQuat.clone().invert();
  const qRel = q.clone().multiply(invCalib);
  const e = euler.setFromQuaternion(qRel, "YXZ");
  return {
    rotation: { x: e.x, y: e.y, z: e.z },
    calibrationQuat
  };
}

// src/lerp.ts
function lerpToOrigin(startRotation, startTime, currentTime, duration) {
  const elapsed = currentTime - startTime;
  const progress = Math.min(elapsed / duration, 1);
  const easedProgress = 1 - Math.pow(1 - progress, 3);
  return {
    rotation: {
      x: startRotation.x * (1 - easedProgress),
      y: startRotation.y * (1 - easedProgress),
      z: startRotation.z * (1 - easedProgress)
    },
    complete: progress >= 1
  };
}

// src/useHandRotation.ts
var DEFAULT_CONFIG = {
  maxHands: 1,
  modelType: "lite",
  detectionInterval: 100,
  lerpDuration: 2e3,
  flipHorizontal: true,
  axisInversion: { x: true, y: false, z: true }
};
function useHandRotation(cameraRef, config) {
  const cfg = react.useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [
    config?.maxHands,
    config?.modelType,
    config?.detectionInterval,
    config?.lerpDuration,
    config?.flipHorizontal,
    config?.axisInversion?.x,
    config?.axisInversion?.y,
    config?.axisInversion?.z
  ]);
  const [rotation, setRotation] = react.useState({ x: 0, y: 0, z: 0 });
  const [handDetected, setHandDetected] = react.useState(false);
  const detectorRef = react.useRef(null);
  const eulerRef = react.useRef(new three.Euler());
  const calibrationQuatRef = react.useRef(null);
  const currentHandednessRef = react.useRef(null);
  const lerpStartTimeRef = react.useRef(null);
  const lerpStartRotationRef = react.useRef({ x: 0, y: 0, z: 0 });
  const handDetectedRef = react.useRef(false);
  const rotationRef = react.useRef({ x: 0, y: 0, z: 0 });
  react.useEffect(() => {
    handDetectedRef.current = handDetected;
  }, [handDetected]);
  react.useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);
  react.useEffect(() => {
    let disposed = false;
    createHandDetector({
      maxHands: cfg.maxHands,
      modelType: cfg.modelType
    }).then((detector) => {
      if (!disposed) {
        detectorRef.current = detector;
      }
    });
    return () => {
      disposed = true;
      detectorRef.current = null;
    };
  }, [cfg.maxHands, cfg.modelType]);
  const detect = react.useCallback(async () => {
    if (!detectorRef.current) return;
    const cam = cameraRef.current;
    if (!cam || !cam.video || cam.video.readyState !== 4) {
      calibrationQuatRef.current = null;
      currentHandednessRef.current = null;
      setHandDetected(false);
      return;
    }
    const video = cam.video;
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    const hands = await estimateHands(detectorRef.current, video, {
      flipHorizontal: cfg.flipHorizontal
    });
    const hand = hands?.[0];
    if (!hand) {
      if (handDetectedRef.current) {
        setHandDetected(false);
        lerpStartTimeRef.current = null;
      }
      if (!lerpStartTimeRef.current) {
        lerpStartTimeRef.current = performance.now();
        lerpStartRotationRef.current = { ...rotationRef.current };
      }
      const { rotation: lerpedRotation, complete } = lerpToOrigin(
        lerpStartRotationRef.current,
        lerpStartTimeRef.current,
        performance.now(),
        cfg.lerpDuration
      );
      setRotation(lerpedRotation);
      if (complete) {
        calibrationQuatRef.current = null;
        currentHandednessRef.current = null;
      }
      return;
    }
    if (!handDetectedRef.current) {
      setHandDetected(true);
      lerpStartTimeRef.current = null;
    }
    const handedness = hand.handedness ?? hand.handednesses?.[0]?.label ?? null;
    if (handedness && handedness !== currentHandednessRef.current) {
      currentHandednessRef.current = handedness;
      calibrationQuatRef.current = null;
    }
    const keypoints3D = hand.keypoints3D;
    if (Array.isArray(keypoints3D) && keypoints3D.length >= 18) {
      const result = computeEulerFromHand(
        keypoints3D,
        handedness,
        calibrationQuatRef.current,
        eulerRef.current
      );
      if (result) {
        calibrationQuatRef.current = result.calibrationQuat;
        const inv = cfg.axisInversion;
        setRotation({
          x: inv.x ? -result.rotation.x : result.rotation.x,
          y: inv.y ? -result.rotation.y : result.rotation.y,
          z: inv.z ? -result.rotation.z : result.rotation.z
        });
      }
    }
  }, [cameraRef, cfg.flipHorizontal, cfg.lerpDuration, cfg.axisInversion]);
  react.useEffect(() => {
    const intervalId = setInterval(() => {
      detect();
    }, cfg.detectionInterval);
    return () => clearInterval(intervalId);
  }, [detect, cfg.detectionInterval]);
  return { rotation, handDetected };
}
var HandCamera = react.forwardRef(
  ({
    mirrored = true,
    className,
    defaultExpanded = true,
    collapsedLabel = "Camera",
    collapseIcon,
    expandIcon
  }, ref) => {
    const [isExpanded, setIsExpanded] = react.useState(defaultExpanded);
    const [isHovered, setIsHovered] = react.useState(false);
    const toggleExpanded = () => setIsExpanded((v) => !v);
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className, style: { position: "relative" }, children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        Webcam__default.default,
        {
          ref,
          mirrored,
          style: {
            opacity: isExpanded ? 1 : 0,
            pointerEvents: isExpanded ? "auto" : "none",
            position: isExpanded ? "static" : "absolute",
            zIndex: isExpanded ? "auto" : -1
          }
        }
      ),
      isExpanded ? /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          style: {
            position: "absolute",
            inset: 0,
            cursor: "pointer"
          },
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
          children: /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              style: {
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.3)",
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.2s"
              },
              onClick: (e) => {
                e.stopPropagation();
                toggleExpanded();
              },
              children: collapseIcon ?? /* @__PURE__ */ jsxRuntime.jsx("span", { style: { color: "white", fontSize: 14 }, children: "Collapse" })
            }
          )
        }
      ) : /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          style: { cursor: "pointer", padding: "8px 12px" },
          onClick: toggleExpanded,
          children: /* @__PURE__ */ jsxRuntime.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: collapsedLabel }),
            expandIcon
          ] })
        }
      )
    ] });
  }
);
HandCamera.displayName = "HandCamera";
function HandOverlay({
  visible,
  message = "Position your hand within the camera's view with your palm facing forward.",
  className,
  children
}) {
  if (!visible) return null;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className, children: children ?? /* @__PURE__ */ jsxRuntime.jsx("p", { children: message }) });
}
var DEFAULTS = {
  smoothTime: 0.25,
  minDelta: 1e-3,
  maxDelta: 0.05
};
function applyDampedRotation(objectRotation, targetRotation, delta, config) {
  const { x, y, z } = targetRotation;
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return;
  const cfg = { ...DEFAULTS, ...config };
  const clampedDelta = Math.min(Math.max(delta, cfg.minDelta), cfg.maxDelta);
  easing.dampE(objectRotation, [x, y, z], cfg.smoothTime, clampedDelta);
}

exports.HandCamera = HandCamera;
exports.HandOverlay = HandOverlay;
exports.applyDampedRotation = applyDampedRotation;
exports.computeEulerFromHand = computeEulerFromHand;
exports.createHandDetector = createHandDetector;
exports.estimateHands = estimateHands;
exports.lerpToOrigin = lerpToOrigin;
exports.useHandRotation = useHandRotation;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map