import { CAMERA_CONFIG } from '@/config/camera.config';
import { SCENE_BOUNDARIES } from '@/config/scene.config';
import {
  calculateLerpFactor,
  isAnimationComplete,
  useCameraAnimation,
} from '@/hooks/useCameraAnimation';
import { useCameraPresets } from '@/hooks/useCameraPresets';
import { useCameraSnapBack } from '@/hooks/useCameraSnapBack';
import { cameraState } from '@/stores/cameraStore';
import { sceneMediator } from '@/stores/sceneMediatorStore';
import type { CameraConfig } from '@/types/configurator';
import { calculateBaseDistance, calculateMinCameraZ } from '@/utils/camera';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSnapshot } from 'valtio';

interface CameraControllerProps {
  /** Optional camera configuration (preferred over model-driven props) */
  cameraConfig?: CameraConfig;
  /** Override base distance calculation (optional) */
  baseDistance?: number;
}

/**
 * Enhanced camera controller with preset system and snap-back behavior
 *
 * Wraps drei's OrbitControls with:
 * - Three predefined camera presets (front-left, front, front-right)
 * - Smooth transitions between presets using Framer Motion
 * - Auto-snap to nearest preset after user interaction
 * - Zoom constraints to prevent camera drift
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <CameraController modelConfig={CABINET_CONFIG} />
 *   <ModelViewer />
 * </Canvas>
 * ```
 */
export default function CameraController({
  cameraConfig,
  baseDistance,
}: CameraControllerProps) {
  const { camera, gl, size } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const snap = useSnapshot(cameraState);
  const sceneSnap = useSnapshot(sceneMediator);

  // Track current spherical position for snap-back calculation
  const currentSpherical = useRef(new THREE.Spherical());

  // Calculate aspect ratio, fallback to default if size not available yet
  const aspect = useMemo(
    () => (size?.width && size?.height ? size.width / size.height : 16 / 10),
    [size.width, size.height],
  );

  // Prepare modelWorld argument - exclude boundingBox to avoid fitRadiusForFOV calculation
  // This matches the original behavior before the refactor
  const modelWorldArg = useMemo(() => {
    if (!sceneSnap.modelWorld) return null;
    return {
      position: sceneSnap.modelWorld.position,
      height: sceneSnap.modelWorld.height,
      // boundingBox intentionally excluded - see git history (reverted in a5b1a83e)
    };
  }, [sceneSnap.modelWorld]);

  // Use camera presets hook for preset generation and coordinate conversion
  const { presets, sphericalToCartesian } = useCameraPresets(
    cameraConfig,
    modelWorldArg,
    aspect,
  );

  // Use camera animation hook for managing animation state
  const { animationTarget, isAnimating, animateToPreset, cancelAnimation } =
    useCameraAnimation({
      presets,
      sphericalToCartesian,
      activePreset: snap.activePreset,
      lastSnapTimestamp: snap.lastSnapTimestamp,
      isUserControlling: snap.isUserControlling,
      transitionDuration: snap.transitionDuration,
    });

  // Use snap-back hook for handling user interaction and model changes
  const { handleStart, handleEnd } = useCameraSnapBack({
    presets,
    sphericalToCartesian,
    cameraPosition: camera.position,
    currentSpherical,
    modelWorld: sceneSnap.modelWorld,
    isUserControlling: snap.isUserControlling,
    isAnimating,
    animateToPreset,
    cancelAnimation,
  });

  // Calculate base distance from model config or prop
  const calculatedBaseDistance = useMemo(() => {
    if (baseDistance) return baseDistance;

    const configuredPosition = cameraConfig?.position || [0, 0, 4];
    return calculateBaseDistance(configuredPosition);
  }, [baseDistance, cameraConfig?.position]);

  /**
   * Update spherical coordinates and handle smooth animation
   * Follows the same pattern as InteractiveMesh.component.tsx
   */
  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    // Handle smooth animation to target preset
    // Only animate if NOT being controlled by user
    if (
      isAnimating.current &&
      animationTarget.current &&
      !snap.isUserControlling
    ) {
      const lerpFactor = calculateLerpFactor(delta, snap.transitionDuration);

      // Interpolate camera position
      camera.position.lerp(animationTarget.current.position, lerpFactor);

      // Interpolate look-at target
      controlsRef.current.target.lerp(
        animationTarget.current.target,
        lerpFactor,
      );
      controlsRef.current.update();

      // Check if animation is complete (close enough to target)
      const positionDistance = camera.position.distanceTo(
        animationTarget.current.position,
      );
      const targetDistance = controlsRef.current.target.distanceTo(
        animationTarget.current.target,
      );

      if (isAnimationComplete(positionDistance, targetDistance)) {
        // Animation complete
        cancelAnimation();
      }

      return; // Skip spherical calculation during animation
    }

    // If user is controlling, cancel any ongoing animation
    if (snap.isUserControlling && isAnimating.current) {
      cancelAnimation();
    }

    // Enforce Z-axis boundary constraint
    // Prevents camera from going behind the scene's back wall
    if (CAMERA_CONFIG.boundaries.Z_AXIS_ENABLED && !isAnimating.current) {
      const minAllowedZ = calculateMinCameraZ(
        SCENE_BOUNDARIES.WALL_Z_POSITION,
        SCENE_BOUNDARIES.CAMERA_SAFETY_MARGIN,
      );

      // Clamp camera Z position if it exceeds the boundary
      if (camera.position.z < minAllowedZ) {
        camera.position.z = minAllowedZ;
        controlsRef.current.update();
      }
    }

    // Update spherical coordinates for snap-back calculation
    // Only when not animating
    if (!isAnimating.current) {
      const controls = controlsRef.current;
      const offset = camera.position.clone().sub(controls.target);
      currentSpherical.current.setFromVector3(offset);
    }
  });

  // Get initial preset position
  const initialPreset = presets[snap.activePreset || 'front-left'];
  const initialPosition = sphericalToCartesian(initialPreset);
  const initialTarget = new THREE.Vector3(...initialPreset.target);

  // Set initial camera position
  useEffect(() => {
    camera.position.copy(initialPosition);
    if (controlsRef.current) {
      controlsRef.current.target.copy(initialTarget);
      controlsRef.current.update();
    }
    // Only run on mount - initial setup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When a model bounding box becomes available, recompute the current preset
  // and re-position the camera and controls target so the framing updates to
  // reflect the actual model geometry.
  // No bounding-box-triggered repositioning — initial position is set on mount

  // Cleanup: clear pending timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (cameraState.snapTimeout !== null) {
        clearTimeout(cameraState.snapTimeout);
        cameraState.snapTimeout = null;
      }
    };
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      // Polar angle constraints (vertical rotation)
      minPolarAngle={CAMERA_CONFIG.rotation.MIN_POLAR_ANGLE}
      maxPolarAngle={CAMERA_CONFIG.rotation.MAX_POLAR_ANGLE}
      // Zoom constraints
      minDistance={Math.max(
        calculatedBaseDistance * CAMERA_CONFIG.zoom.MIN_DISTANCE_MULTIPLIER,
        CAMERA_CONFIG.zoom.MIN_ABSOLUTE_DISTANCE,
      )}
      maxDistance={
        calculatedBaseDistance * CAMERA_CONFIG.zoom.MAX_DISTANCE_MULTIPLIER
      }
      // Azimuthal angle constraints (horizontal rotation)
      minAzimuthAngle={CAMERA_CONFIG.rotation.MIN_AZIMUTH_ANGLE}
      maxAzimuthAngle={CAMERA_CONFIG.rotation.MAX_AZIMUTH_ANGLE}
      // Interaction settings
      enableZoom={true}
      enablePan={CAMERA_CONFIG.controls.ENABLE_PAN}
      enableDamping={CAMERA_CONFIG.controls.ENABLE_DAMPING}
      zoomSpeed={CAMERA_CONFIG.controls.ZOOM_SPEED}
      rotateSpeed={CAMERA_CONFIG.controls.ROTATE_SPEED}
      // Event handlers for snap-back behavior
      onStart={handleStart}
      onEnd={handleEnd}
      onChange={() => {
        // Continuously update spherical coords during drag
        // This ensures we always have fresh coordinates for snap-back
        if (controlsRef.current && !isAnimating.current) {
          const offset = camera.position
            .clone()
            .sub(controlsRef.current.target);
          currentSpherical.current.setFromVector3(offset);
        }
      }}
      // Look-at target
      target={initialTarget}
      // DOM element
      domElement={gl.domElement}
    />
  );
}
