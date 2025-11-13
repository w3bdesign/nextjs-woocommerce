/**
 * useCameraSnapBack Hook
 *
 * Handles snap-back behavior for camera controls.
 * Manages finding the nearest preset after user interaction and
 * debounced reactions to model world changes.
 */

import { CAMERA_CONFIG } from '@/config/camera.config';
import {
  endCameraControl,
  startCameraControl,
  type CameraPreset,
  type CameraPresetId,
} from '@/stores/cameraStore';
import type { WorldBoundingBox } from '@/utils/boundingBox';
import {
  calculateBoundingBoxCenter,
  calculateBoundingBoxSize,
} from '@/utils/boundingBox';
import type React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ModelWorld {
  readonly boundingBox: WorldBoundingBox;
  readonly position: readonly [number, number, number];
  readonly height: number;
  readonly scale: number;
}

interface UseCameraSnapBackParams {
  /** Camera presets for distance calculations */
  presets: Record<CameraPresetId, CameraPreset>;
  /** Function to convert spherical coordinates to cartesian */
  sphericalToCartesian: (preset: CameraPreset) => THREE.Vector3;
  /** Current camera position from Three.js */
  cameraPosition: THREE.Vector3;
  /** Current spherical coordinates ref (updated in useFrame) */
  currentSpherical: React.MutableRefObject<THREE.Spherical>;
  /** Model world state from scene mediator */
  modelWorld: ModelWorld | null;
  /** Whether user is currently controlling the camera */
  isUserControlling: boolean;
  /** Whether animation is currently in progress */
  isAnimating: React.MutableRefObject<boolean>;
  /** Function to start animating to a preset */
  animateToPreset: (presetId: string) => void;
  /** Function to cancel any ongoing animation */
  cancelAnimation: () => void;
}

interface UseCameraSnapBackResult {
  /** Handler for when user starts controlling camera */
  handleStart: () => void;
  /** Handler for when user stops controlling camera */
  handleEnd: () => void;
  /** Function to find nearest preset ID based on camera position */
  pickNearestPresetId: () => string;
}

/**
 * Custom hook for managing camera snap-back behavior
 *
 * Features:
 * - Snap to nearest preset after user interaction ends
 * - Debounced reaction to model world changes
 * - Threshold-based detection of significant model changes
 * - Automatic cleanup of timeouts
 *
 * @param params - Snap-back parameters including presets and state
 * @returns Event handlers and utility functions
 *
 * @example
 * ```tsx
 * const { handleStart, handleEnd, pickNearestPresetId } = useCameraSnapBack({
 *   presets,
 *   sphericalToCartesian,
 *   cameraPosition: camera.position,
 *   currentSpherical,
 *   modelWorld: sceneSnap.modelWorld,
 *   isUserControlling: snap.isUserControlling,
 *   isAnimating,
 *   animateToPreset,
 * });
 *
 * // In OrbitControls:
 * <OrbitControls onStart={handleStart} onEnd={handleEnd} />
 * ```
 */
export const useCameraSnapBack = ({
  presets,
  sphericalToCartesian,
  cameraPosition,
  currentSpherical,
  modelWorld,
  isUserControlling,
  isAnimating,
  animateToPreset,
  cancelAnimation,
}: UseCameraSnapBackParams): UseCameraSnapBackResult => {
  // Track previous model world state for change detection
  const lastModelWorldRef = useRef<ModelWorld | null>(null);
  const mediatorDebounceRef = useRef<number | null>(null);

  /**
   * Find the nearest preset based on camera distance to preset positions
   * Uses cartesian distance for simplicity and consistency
   */
  const pickNearestPresetId = (): string => {
    const cameraPos = cameraPosition.clone();
    let bestId = 'front';
    let bestDist = Infinity;

    (Object.keys(presets) as Array<keyof typeof presets>).forEach((id) => {
      const preset = presets[id];
      const presetPos = sphericalToCartesian(preset as CameraPreset);
      const distance = cameraPos.distanceTo(presetPos);

      if (distance < bestDist) {
        bestDist = distance;
        bestId = id as string;
      }
    });

    return bestId;
  };

  /**
   * Compute bounding box center, size, and diagonal
   * Used for threshold-based change detection
   */
  const computeBoxCenterAndSize = (mw: ModelWorld) => {
    const center = calculateBoundingBoxCenter(mw.boundingBox);
    const size = calculateBoundingBoxSize(mw.boundingBox);
    const centerVec = new THREE.Vector3(center.x, center.y, center.z);
    const sizeVec = new THREE.Vector3(size.width, size.height, size.depth);
    const diag = sizeVec.length();
    return { center: centerVec, size: sizeVec, diag };
  };

  /**
   * Debounced reaction to mediator modelWorld updates.
   * Only auto-snap when changes exceed configured thresholds and user is not interacting.
   */
  useEffect(() => {
    const mw = modelWorld;

    // Clear any previous debounce
    if (mediatorDebounceRef.current !== null) {
      clearTimeout(mediatorDebounceRef.current);
      mediatorDebounceRef.current = null;
    }

    if (!mw) {
      // nothing to do, but update lastModelWorldRef
      lastModelWorldRef.current = null;
      return;
    }

    // Schedule debounced handling
    mediatorDebounceRef.current = window.setTimeout(() => {
      // If user is currently controlling the camera, skip auto-snapping for now
      if (isUserControlling) {
        // leave lastModelWorldRef as-is so we compare against the previous once user stops
        mediatorDebounceRef.current = null;
        return;
      }

      const prev = lastModelWorldRef.current;
      const next = mw;

      // First-time availability -> animate to a sensible preset
      if (!prev) {
        lastModelWorldRef.current = next;
        // choose nearest preset (keeps user's current orientation sensible)
        const id = pickNearestPresetId();
        animateToPreset(id);
        mediatorDebounceRef.current = null;
        return;
      }

      // Compute centers and sizes to decide whether to snap
      const prevMetrics = computeBoxCenterAndSize(prev);
      const nextMetrics = computeBoxCenterAndSize(next);

      const centerShift = prevMetrics.center.distanceTo(nextMetrics.center);
      const centerRel =
        prevMetrics.diag > 0 ? centerShift / prevMetrics.diag : centerShift;

      const sizeRelChange =
        Math.abs(nextMetrics.diag - prevMetrics.diag) /
        Math.max(prevMetrics.diag, 1e-6);

      const shouldSnap =
        centerRel > CAMERA_CONFIG.snapBack.CENTER_SHIFT_THRESHOLD ||
        sizeRelChange > CAMERA_CONFIG.snapBack.SIZE_CHANGE_THRESHOLD;

      if (shouldSnap && !isAnimating.current) {
        const id = pickNearestPresetId();
        animateToPreset(id);
      }

      lastModelWorldRef.current = next;
      mediatorDebounceRef.current = null;
    }, CAMERA_CONFIG.snapBack.MEDIATOR_DEBOUNCE_MS);

    return () => {
      if (mediatorDebounceRef.current !== null) {
        clearTimeout(mediatorDebounceRef.current);
        mediatorDebounceRef.current = null;
      }
    };
    // Dependencies include all values used in the effect
    // pickNearestPresetId and animateToPreset are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelWorld, isUserControlling]);

  /**
   * Handler for when user starts controlling the camera
   * Cancels any pending snap-back timeout and any ongoing animation
   */
  const handleStart = () => {
    startCameraControl();

    // Force cancel animation immediately
    if (isAnimating.current) {
      cancelAnimation();
    }
  };

  /**
   * Handler for when user stops controlling the camera
   * Schedules snap-back to nearest preset after delay
   */
  const handleEnd = () => {
    endCameraControl(currentSpherical.current, presets);
  };

  return {
    handleStart,
    handleEnd,
    pickNearestPresetId,
  };
};
