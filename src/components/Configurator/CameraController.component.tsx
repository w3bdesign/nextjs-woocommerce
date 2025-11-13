import { CAMERA_CONFIG } from '@/config/camera.config';
import {
  cameraState,
  endCameraControl,
  generateCameraPresetsFromCamera,
  startCameraControl,
  type CameraPreset,
} from '@/stores/cameraStore';
import { sceneMediator } from '@/stores/sceneMediatorStore';
import type { CameraConfig } from '@/types/configurator';
import {
  calculateBoundingBoxCenter,
  calculateBoundingBoxSize,
} from '@/utils/boundingBox';
import { calculateBaseDistance } from '@/utils/camera';
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

  // Track if animation is in progress to prevent control conflicts
  const isAnimating = useRef(false);

  // Animation state - stores target position and target for smooth interpolation
  const animationTarget = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null>(null);

  // Generate presets based on camera configuration and, when available,
  // runtime-computed model geometry from the mediator. This avoids
  // passing full model configs into environment components.
  const presets = useMemo(() => {
    const modelWorldArg = sceneSnap.modelWorld
      ? {
          position: sceneSnap.modelWorld.position as [number, number, number],
          height: sceneSnap.modelWorld.height,
        }
      : undefined;

    // Pass actual canvas aspect ratio so fitting math is accurate per viewport
    const aspect =
      size?.width && size?.height ? size.width / size.height : undefined;
    return generateCameraPresetsFromCamera(cameraConfig, modelWorldArg, aspect);
  }, [cameraConfig, sceneSnap.modelWorld, size.width, size.height]);

  // Debounced reaction to mediator modelWorld updates.
  // Only auto-snap when changes exceed configured thresholds and user is not interacting.
  const lastModelWorldRef = useRef<typeof sceneSnap.modelWorld | null>(null);
  const mediatorDebounceRef = useRef<number | null>(null);

  const computeBoxCenterAndSize = (
    mw: NonNullable<typeof sceneSnap.modelWorld>,
  ) => {
    const center = calculateBoundingBoxCenter(mw.boundingBox);
    const size = calculateBoundingBoxSize(mw.boundingBox);
    const centerVec = new THREE.Vector3(center.x, center.y, center.z);
    const sizeVec = new THREE.Vector3(size.width, size.height, size.depth);
    const diag = sizeVec.length();
    return { center: centerVec, size: sizeVec, diag };
  };

  // Pick nearest preset id by comparing camera distance to preset positions
  const pickNearestPresetId = (): string => {
    const cameraPos = camera.position.clone();
    let bestId = 'front';
    let bestDist = Infinity;
    (Object.keys(presets) as Array<keyof typeof presets>).forEach((id) => {
      const p = presets[id];
      const pos = sphericalToCartesian(p as CameraPreset);
      const d = cameraPos.distanceTo(pos);
      if (d < bestDist) {
        bestDist = d;
        bestId = id as string;
      }
    });
    return bestId;
  };

  useEffect(() => {
    const mw = sceneSnap.modelWorld;
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
      if (snap.isUserControlling) {
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
    // Intentionally depend on sceneSnap.modelWorld and snap.isUserControlling
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneSnap.modelWorld, snap.isUserControlling]);

  // Calculate base distance from model config or prop
  const calculatedBaseDistance = useMemo(() => {
    if (baseDistance) return baseDistance;

    const configuredPosition = cameraConfig?.position || [0, 0, 4];
    return calculateBaseDistance(configuredPosition);
  }, [baseDistance, cameraConfig?.position]);

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
        (delta / snap.transitionDuration) * CAMERA_CONFIG.animation.LERP_SPEED,
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
        positionDistance < CAMERA_CONFIG.animation.COMPLETION_THRESHOLD &&
        targetDistance < CAMERA_CONFIG.animation.COMPLETION_THRESHOLD
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
