/**
 * useCameraAnimation Hook
 *
 * Handles camera animation state machine with lerp-based interpolation.
 * Manages animation lifecycle: start, interpolate, complete, and cancel.
 */

import { CAMERA_CONFIG } from '@/config/camera.config';
import type { CameraPreset, CameraPresetId } from '@/stores/cameraStore';
import type React from 'react';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AnimationTarget {
  position: THREE.Vector3;
  target: THREE.Vector3;
}

interface UseCameraAnimationParams {
  /** Camera presets for position lookup */
  presets: Record<CameraPresetId, CameraPreset>;
  /** Function to convert spherical coordinates to cartesian */
  sphericalToCartesian: (preset: CameraPreset) => THREE.Vector3;
  /** Active preset ID from store */
  activePreset: CameraPresetId | null;
  /** Timestamp of last snap event (for detecting changes) */
  lastSnapTimestamp: number;
  /** Whether user is currently controlling the camera */
  isUserControlling: boolean;
  /** Animation transition duration in seconds */
  transitionDuration: number;
}

interface UseCameraAnimationResult {
  /** Current animation target (null if not animating) */
  animationTarget: React.MutableRefObject<AnimationTarget | null>;
  /** Whether animation is currently in progress */
  isAnimating: React.MutableRefObject<boolean>;
  /** Function to start animating to a specific preset */
  animateToPreset: (presetId: string) => void;
  /** Function to cancel any ongoing animation */
  cancelAnimation: () => void;
}

/**
 * Custom hook for managing camera animation state
 *
 * Handles the animation lifecycle:
 * 1. Start: Set animation target when preset changes
 * 2. Interpolate: Lerp camera position/target in useFrame (done in component)
 * 3. Complete: Detect when animation is close enough to target
 * 4. Cancel: Stop animation when user interacts
 *
 * @param params - Animation parameters including presets and state
 * @returns Animation state and control functions
 *
 * @example
 * ```tsx
 * const { animationTarget, isAnimating, animateToPreset, cancelAnimation } =
 *   useCameraAnimation({
 *     presets,
 *     sphericalToCartesian,
 *     activePreset: snap.activePreset,
 *     lastSnapTimestamp: snap.lastSnapTimestamp,
 *     isUserControlling: snap.isUserControlling,
 *     transitionDuration: snap.transitionDuration,
 *   });
 *
 * // In useFrame:
 * if (isAnimating.current && animationTarget.current) {
 *   // Interpolate to animationTarget.current.position/target
 * }
 * ```
 */
export const useCameraAnimation = ({
  presets,
  sphericalToCartesian,
  activePreset,
  lastSnapTimestamp,
  isUserControlling,
  transitionDuration: _transitionDuration,
}: UseCameraAnimationParams): UseCameraAnimationResult => {
  // Animation state - stores target position and target for smooth interpolation
  const animationTarget = useRef<AnimationTarget | null>(null);

  // Track if animation is in progress to prevent control conflicts
  const isAnimating = useRef(false);

  // Track previous timestamp to detect changes
  const previousSnapTimestamp = useRef(lastSnapTimestamp);

  /**
   * Start animating camera to a specific preset with smooth interpolation
   * Sets the animation target which will be interpolated in useFrame
   */
  const animateToPreset = (presetId: string) => {
    const preset = presets[presetId as keyof typeof presets];
    if (!preset) return;

    const targetPosition = sphericalToCartesian(preset);
    const targetTarget = new THREE.Vector3(...preset.target);

    // Set animation target for useFrame to interpolate
    animationTarget.current = {
      position: targetPosition,
      target: targetTarget,
    };

    isAnimating.current = true;
  };

  /**
   * Cancel any ongoing animation
   * Called when user starts controlling the camera
   */
  const cancelAnimation = () => {
    isAnimating.current = false;
    animationTarget.current = null;
  };

  /**
   * React to preset changes from store
   * Animates to nearest preset after user stops dragging (snap-back)
   */
  useEffect(() => {
    // Animate when:
    // 1. lastSnapTimestamp changed (a snap event just happened)
    // 2. User is not currently controlling the camera (finished dragging)
    // 3. Not already animating
    // We use lastSnapTimestamp instead of activePreset comparison to handle
    // the case where we snap to the same preset twice in a row
    if (
      activePreset &&
      lastSnapTimestamp !== previousSnapTimestamp.current &&
      !isUserControlling &&
      !isAnimating.current
    ) {
      animateToPreset(activePreset);
      previousSnapTimestamp.current = lastSnapTimestamp;
    }
    // animateToPreset is stable, no need to include in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastSnapTimestamp, isUserControlling, activePreset]);

  return {
    animationTarget,
    isAnimating,
    animateToPreset,
    cancelAnimation,
  };
};

/**
 * Helper function to calculate lerp factor for animation
 * Should be called in useFrame with delta time
 *
 * @param delta - Time since last frame in seconds
 * @param transitionDuration - Total animation duration in seconds
 * @returns Lerp factor clamped to [0, 1]
 */
export const calculateLerpFactor = (
  delta: number,
  transitionDuration: number,
): number => {
  return Math.min(
    (delta / transitionDuration) * CAMERA_CONFIG.animation.LERP_SPEED,
    1,
  );
};

/**
 * Helper function to check if animation is complete
 * Compares distances to completion threshold
 *
 * @param positionDistance - Distance from camera to target position
 * @param targetDistance - Distance from controls target to animation target
 * @returns True if animation is complete (within threshold)
 */
export const isAnimationComplete = (
  positionDistance: number,
  targetDistance: number,
): boolean => {
  return (
    positionDistance < CAMERA_CONFIG.animation.COMPLETION_THRESHOLD &&
    targetDistance < CAMERA_CONFIG.animation.COMPLETION_THRESHOLD
  );
};
