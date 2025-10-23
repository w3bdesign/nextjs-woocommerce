import {
  cameraState,
  endCameraControl,
  generateCameraPresets,
  startCameraControl,
  type CameraPreset,
} from '@/stores/cameraStore';
import type { ModelConfig } from '@/types/configurator';
import { calculateBaseDistance } from '@/utils/camera';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSnapshot } from 'valtio';

/**
 * Animation configuration constants
 */
const ANIMATION_LERP_SPEED = 5; // Multiplier for lerp speed
const ANIMATION_COMPLETION_THRESHOLD = 0.001; // Distance threshold for animation completion

interface CameraControllerProps {
  /** Model configuration for dynamic preset generation */
  modelConfig: ModelConfig;
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
  modelConfig,
  baseDistance,
}: CameraControllerProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const snap = useSnapshot(cameraState);

  // Track current spherical position for snap-back calculation
  const currentSpherical = useRef(new THREE.Spherical());

  // Track if animation is in progress to prevent control conflicts
  const isAnimating = useRef(false);

  // Animation state - stores target position and target for smooth interpolation
  const animationTarget = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null>(null);

  // Generate presets based on model configuration
  const presets = useMemo(() => {
    return generateCameraPresets(modelConfig);
  }, [modelConfig]);

  // Calculate base distance from model config or prop
  const calculatedBaseDistance = useMemo(() => {
    if (baseDistance) return baseDistance;

    const configuredPosition = modelConfig.camera?.position || [0, 0, 4];
    return calculateBaseDistance(configuredPosition);
  }, [baseDistance, modelConfig.camera?.position]);

  /**
   * Convert spherical coordinates to cartesian position
   */
  const sphericalToCartesian = (preset: CameraPreset): THREE.Vector3 => {
    const [radius, theta, phi] = preset.spherical;
    const [tx, ty, tz] = preset.target;

    const spherical = new THREE.Spherical(radius, phi, theta);
    const offset = new THREE.Vector3().setFromSpherical(spherical);

    return new THREE.Vector3(tx + offset.x, ty + offset.y, tz + offset.z);
  };

  /**
   * Animate camera to a specific preset with smooth interpolation
   * Sets the animation target which will be interpolated in useFrame
   */
  const animateToPreset = (presetId: string) => {
    const preset = presets[presetId as keyof typeof presets];
    if (!preset || !controlsRef.current) return;

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
   * React to preset changes from store
   * Animates to nearest preset after user stops dragging (snap-back)
   */
  const previousSnapTimestamp = useRef(snap.lastSnapTimestamp);

  useEffect(() => {
    // Animate when:
    // 1. lastSnapTimestamp changed (a snap event just happened)
    // 2. User is not currently controlling the camera (finished dragging)
    // 3. Not already animating
    // We use lastSnapTimestamp instead of activePreset comparison to handle
    // the case where we snap to the same preset twice in a row
    if (
      snap.activePreset &&
      snap.lastSnapTimestamp !== previousSnapTimestamp.current &&
      !snap.isUserControlling &&
      !isAnimating.current
    ) {
      animateToPreset(snap.activePreset);
      previousSnapTimestamp.current = snap.lastSnapTimestamp;
    }
    // animateToPreset is stable, no need to include in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap.lastSnapTimestamp, snap.isUserControlling]);

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
      const lerpFactor = Math.min(
        (delta / snap.transitionDuration) * ANIMATION_LERP_SPEED,
        1,
      );

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

      if (
        positionDistance < ANIMATION_COMPLETION_THRESHOLD &&
        targetDistance < ANIMATION_COMPLETION_THRESHOLD
      ) {
        // Animation complete
        isAnimating.current = false;
        animationTarget.current = null;
      }

      return; // Skip spherical calculation during animation
    }

    // If user is controlling, cancel any ongoing animation
    if (snap.isUserControlling && isAnimating.current) {
      isAnimating.current = false;
      animationTarget.current = null;
    }

    // Update spherical coordinates for snap-back calculation
    // Only when not animating
    if (!isAnimating.current) {
      const controls = controlsRef.current;
      const offset = camera.position.clone().sub(controls.target);
      currentSpherical.current.setFromVector3(offset);
    }
  });

  /**
   * Event handlers for user interaction
   */
  const handleStart = () => {
    // ALWAYS start user control, even if animating
    // This will cancel any ongoing animation via useFrame check
    startCameraControl();

    // Force cancel animation immediately
    if (isAnimating.current) {
      isAnimating.current = false;
      animationTarget.current = null;
    }
  };

  const handleEnd = () => {
    // ALWAYS trigger snap-back when user releases
    // The endCameraControl function will handle the timeout properly
    endCameraControl(currentSpherical.current, presets);
  };

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
      // Polar angle constraints (vertical rotation) - very loose for maximum freedom
      minPolarAngle={0} // Allow looking from directly above
      maxPolarAngle={Math.PI / 2} // Only prevent looking from below (horizontal is the limit)
      // Zoom constraints - prevent zooming out beyond default
      minDistance={calculatedBaseDistance * 0.6} // Allow 40% zoom in
      maxDistance={calculatedBaseDistance * 1.1} // Allow slight zoom out for context
      // Azimuthal angle constraints (horizontal rotation)
      // No constraints - allow full 360° rotation
      minAzimuthAngle={-Infinity}
      maxAzimuthAngle={Infinity}
      // Interaction settings
      enableZoom={true}
      enablePan={false} // Disable panning to keep object centered
      enableDamping={false} // Disable damping for immediate response
      zoomSpeed={0.8} // Zoom speed
      rotateSpeed={1.0} // Full rotation speed for smooth control
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
