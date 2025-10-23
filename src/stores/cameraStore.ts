import type { ModelConfig } from '@/types/configurator';
import { calculateBaseDistance } from '@/utils/camera';
import * as THREE from 'three';
import { proxy } from 'valtio';

/**
 * Configuration constants for camera behavior
 */
const TARGET_HEIGHT_RATIO = 0.45; // Look slightly below center for better base visibility
const PRESET_THETA_ANGLE = 0.17; // Horizontal angle: 0.2π rad (≈36°)
const PRESET_PHI_ANGLE = 0.42; // Vertical angle: 0.42π rad (~75.6°) - slightly less top-down

/**
 * Spherical coordinates tuple with named elements
 * [radius, theta (horizontal angle), phi (vertical angle from top)]
 */
export type SphericalCoordinates = readonly [
  radius: number,
  theta: number,
  phi: number,
];

/**
 * 3D position tuple
 */
export type Position3D = readonly [x: number, y: number, z: number];

/**
 * Camera preset identifiers for the three main viewing angles
 */
export type CameraPresetId = 'front-left' | 'front' | 'front-right';

/**
 * Camera preset configuration using spherical coordinates
 * Spherical coordinates make rotational positioning more intuitive
 */
export interface CameraPreset {
  /** Unique identifier for this preset */
  id: CameraPresetId;
  /** Display name for UI */
  name: string;
  /** Spherical coordinates: [radius, theta (horizontal angle), phi (vertical angle)] */
  spherical: SphericalCoordinates;
  /** Look-at target position in 3D space */
  target: Position3D;
}

/**
 * Camera state management
 * Tracks user interaction and preset transitions
 */
interface CameraState {
  /** Currently active preset */
  activePreset: CameraPresetId | null;

  /** Whether camera is currently being controlled by user */
  isUserControlling: boolean;

  /** Whether to snap back to nearest preset after user interaction */
  autoSnapEnabled: boolean;

  /** Timeout reference for snap-back delay */
  snapTimeout: number | null;

  /** Snap-back delay in milliseconds */
  snapDelay: number;

  /** Animation duration for preset transitions in seconds */
  transitionDuration: number;

  /** Timestamp of last snap event (for forcing re-renders on same preset) */
  lastSnapTimestamp: number;
  // no bounding box stored here by default
}

/**
 * Camera state using Valtio proxy
 * Follows the same pattern as configuratorStore
 */
export const cameraState = proxy<CameraState>({
  activePreset: 'front-left', // Default to elevated front-left view
  isUserControlling: false,
  autoSnapEnabled: true,
  snapTimeout: null,
  snapDelay: 500, // Wait 500ms after user stops moving
  transitionDuration: 1.0, // 1s for smooth transitions
  lastSnapTimestamp: 0, // Timestamp of last snap event
});

/**
 * Generate camera presets dynamically based on model configuration
 * This ensures consistent framing regardless of model size/position
 *
 * @param modelConfig - The model configuration containing position and camera settings
 * @returns Record of camera presets keyed by preset ID
 */
export const generateCameraPresets = (
  modelConfig: ModelConfig,
  boundingBox?: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  } | null,
  baseDistanceOverride?: number,
  fovDeg?: number,
  aspect?: number,
  padding = 1.08,
): Record<CameraPresetId, CameraPreset> => {
  // Extract model position (default to origin)
  const modelPos = modelConfig.position || [0, 0, 0];

  // Calculate base distance from model's camera config or use override
  const configuredPosition = modelConfig.camera?.position || [0, 0, 4];
  let baseDistance =
    baseDistanceOverride ?? calculateBaseDistance(configuredPosition);

  // If we have a bounding box and camera parameters, prefer the FOV-based
  // estimator to compute a distance that fits the model precisely.
  if (boundingBox && typeof fovDeg === 'number' && typeof aspect === 'number') {
    baseDistance = estimateDistanceForFov(boundingBox, fovDeg, aspect, padding);
  }

  // Prefer using the actual loaded bounding box (if available) to derive
  // a more accurate target (center) and target height. Fall back to
  // modelConfig.dimensions if bounding box isn't available.
  let targetHeight = modelPos[1];
  let targetX = modelPos[0];
  let targetZ = modelPos[2];

  if (boundingBox) {
    const min = boundingBox.min;
    const max = boundingBox.max;
    const height = max.y - min.y;
    targetHeight = min.y + height * TARGET_HEIGHT_RATIO;
    targetX = (min.x + max.x) / 2;
    targetZ = (min.z + max.z) / 2;
  } else if (modelConfig.dimensions?.height) {
    // For models with dimension config: look at configured ratio of the height
    // Height in cm * scale gives us the 3D units height
    const heightInUnits =
      modelConfig.dimensions.height.default * (modelConfig.scale || 1);
    targetHeight = modelPos[1] + heightInUnits * TARGET_HEIGHT_RATIO;
  } else {
    // For models without dimensions: simple offset
    targetHeight = modelPos[1] + 0.2;
  }

  // Define the three main presets using spherical coordinates
  // Theta: horizontal rotation (0 = front, + = left, - = right)
  // Phi: vertical angle from TOP (0 = directly above, π/2 = horizontal, π = directly below)
  // For furniture viewing, we want phi around 0.45π-0.55π rad (≈81-99° from top)
  return {
    'front-left': {
      id: 'front-left',
      name: 'Elevated Three-Quarter Left',
      // 0.28π rad (≈50.4°) left, 0.47π rad (≈84.6°) from top
      spherical: [
        baseDistance,
        Math.PI * PRESET_THETA_ANGLE,
        Math.PI * PRESET_PHI_ANGLE,
      ],
      target: [targetX, targetHeight, targetZ],
    },
    front: {
      id: 'front',
      name: 'Frontal (Au Face)',
      // Dead center, 0.47π rad (≈84.6°) from top
      spherical: [baseDistance, 0, Math.PI * PRESET_PHI_ANGLE],
      target: [targetX, targetHeight, targetZ],
    },
    'front-right': {
      id: 'front-right',
      name: 'Elevated Three-Quarter Right',
      // 0.28π rad (≈50.4°) right, 0.47π rad (≈84.6°) from top
      spherical: [
        baseDistance,
        -Math.PI * PRESET_THETA_ANGLE,
        Math.PI * PRESET_PHI_ANGLE,
      ],
      target: [targetX, targetHeight, targetZ],
    },
  };
};

/**
 * Compute an approximate camera radius (distance) that frames the bounding box
 * Uses bounding-sphere estimate: radius = diagonal / 2 * factor
 */
export const estimateRadiusFromBoundingBox = (
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  },
  factor = 1.2,
): number => {
  const dx = boundingBox.max.x - boundingBox.min.x;
  const dy = boundingBox.max.y - boundingBox.min.y;
  const dz = boundingBox.max.z - boundingBox.min.z;
  const diagonal = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return (diagonal / 2) * factor;
};

/**
 * Estimate camera distance needed to fit the bounding box using camera FOV and aspect.
 * Uses bounding sphere radius and computes required distance from both vertical and
 * horizontal FOVs, returning the larger value to ensure the model fits.
 */
export const estimateDistanceForFov = (
  boundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  },
  fovDeg: number,
  aspect: number,
  padding = 1.05,
): number => {
  const dx = boundingBox.max.x - boundingBox.min.x;
  const dy = boundingBox.max.y - boundingBox.min.y;
  const dz = boundingBox.max.z - boundingBox.min.z;
  const radius = Math.sqrt(dx * dx + dy * dy + dz * dz) / 2;

  const fovY = (fovDeg * Math.PI) / 180;
  // vertical distance to fit sphere: r / sin(fovY/2)
  const distY = radius / Math.sin(fovY / 2);

  // horizontal FOV
  const fovX = 2 * Math.atan(Math.tan(fovY / 2) * aspect);
  const distX = radius / Math.sin(fovX / 2);

  return Math.max(distX, distY) * padding;
};

/**
 * Calculate which preset is closest to the current camera position
 * Uses angular distance in spherical coordinates for more intuitive matching
 *
 * @param currentSpherical - Current camera position in spherical coordinates
 * @param presets - Available camera presets
 * @returns The ID of the nearest preset
 */
export const findNearestPreset = (
  currentSpherical: THREE.Spherical,
  presets: Record<CameraPresetId, CameraPreset>,
): CameraPresetId => {
  let nearestId: CameraPresetId = 'front-left';
  let minDistance = Infinity;

  Object.entries(presets).forEach(([id, preset]) => {
    const [, theta, phi] = preset.spherical;

    // Calculate angular distance properly handling angle wrapping
    // Theta (azimuthal) can wrap around from -π to +π
    let thetaDiff = Math.abs(currentSpherical.theta - theta);
    // Handle wrap-around: if difference is > π, use the shorter path
    if (thetaDiff > Math.PI) {
      thetaDiff = 2 * Math.PI - thetaDiff;
    }

    // Phi (polar) doesn't wrap, just use absolute difference
    const phiDiff = Math.abs(currentSpherical.phi - phi);

    // Equal weight for both angles - just find the geometrically nearest preset
    // The spherical distance metric will naturally create good snap zones
    const angularDistance = thetaDiff + phiDiff;

    if (angularDistance < minDistance) {
      minDistance = angularDistance;
      nearestId = id as CameraPresetId;
    }
  });

  return nearestId;
};

/**
 * User interaction handlers
 */

/**
 * Called when user starts controlling the camera
 * Clears any pending snap-back timeout
 */
export const startCameraControl = (): void => {
  cameraState.isUserControlling = true;

  // Clear any pending snap timeout
  if (cameraState.snapTimeout !== null) {
    clearTimeout(cameraState.snapTimeout);
    cameraState.snapTimeout = null;
  }
};

/**
 * Called when user stops controlling the camera
 * Schedules snap-back to nearest preset after delay
 *
 * @param currentSpherical - Current camera position in spherical coordinates
 * @param presets - Available camera presets
 */
export const endCameraControl = (
  currentSpherical: THREE.Spherical,
  presets: Record<CameraPresetId, CameraPreset>,
): void => {
  cameraState.isUserControlling = false;

  if (!cameraState.autoSnapEnabled) return;

  // Clear any existing timeout first (in case this is called multiple times)
  if (cameraState.snapTimeout !== null) {
    clearTimeout(cameraState.snapTimeout);
    cameraState.snapTimeout = null;
  }

  // Schedule snap-back after delay
  const timeout = window.setTimeout(() => {
    // Only snap if user is still not controlling (they didn't start dragging again)
    if (!cameraState.isUserControlling) {
      const nearestPreset = findNearestPreset(currentSpherical, presets);
      cameraState.activePreset = nearestPreset;
      // Update timestamp to force re-render even if preset is the same
      cameraState.lastSnapTimestamp = Date.now();
    }
    cameraState.snapTimeout = null;
  }, cameraState.snapDelay);

  cameraState.snapTimeout = timeout;
};
