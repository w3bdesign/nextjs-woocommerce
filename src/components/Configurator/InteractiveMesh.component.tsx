import { configuratorState } from '@/stores/configuratorStore';
import type { InteractivePart } from '@/types/configurator';
import { useFrame } from '@react-three/fiber';
import { useRef, type ReactElement } from 'react';
import type { Group } from 'three';
import { Euler, Vector3 } from 'three';
import { useSnapshot } from 'valtio';

interface InteractiveMeshProps {
  part: InteractivePart;
  geometry: any;
  material: any;
}

/**
 * Animated mesh component for interactive parts
 * Smoothly interpolates between active and inactive states
 */
export default function InteractiveMesh({
  part,
  geometry,
  material,
}: InteractiveMeshProps): ReactElement {
  const meshRef = useRef<Group>(null);
  const snap = useSnapshot(configuratorState);

  // Use stateKey if provided, otherwise fall back to nodeName
  const stateKey = part.stateKey || part.nodeName;
  const isActive = snap.interactiveStates[stateKey] ?? part.defaultState;
  const targetState = isActive ? part.activeState : part.inactiveState;
  const duration = part.animationDuration ?? 500; // milliseconds

  // Smooth animation interpolation
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const speed = (delta * 1000) / duration; // Normalized animation speed
    const lerpFactor = Math.min(speed * 5, 1); // 5x multiplier for smoother animation

    // Interpolate rotation
    if (targetState.rotation) {
      const targetRotation = new Euler(...targetState.rotation);
      meshRef.current.rotation.x +=
        (targetRotation.x - meshRef.current.rotation.x) * lerpFactor;
      meshRef.current.rotation.y +=
        (targetRotation.y - meshRef.current.rotation.y) * lerpFactor;
      meshRef.current.rotation.z +=
        (targetRotation.z - meshRef.current.rotation.z) * lerpFactor;
    }

    // Interpolate position
    if (targetState.position) {
      const targetPosition = new Vector3(...targetState.position);
      meshRef.current.position.x +=
        (targetPosition.x - meshRef.current.position.x) * lerpFactor;
      meshRef.current.position.y +=
        (targetPosition.y - meshRef.current.position.y) * lerpFactor;
      meshRef.current.position.z +=
        (targetPosition.z - meshRef.current.position.z) * lerpFactor;
    }

    // Interpolate scale
    if (targetState.scale !== undefined) {
      const targetScale =
        typeof targetState.scale === 'number'
          ? targetState.scale
          : targetState.scale[0]; // Use x scale if array
      meshRef.current.scale.x +=
        (targetScale - meshRef.current.scale.x) * lerpFactor;
      meshRef.current.scale.y +=
        (targetScale - meshRef.current.scale.y) * lerpFactor;
      meshRef.current.scale.z +=
        (targetScale - meshRef.current.scale.z) * lerpFactor;
    }
  });

  // Handle visibility toggle
  if (part.visibilityToggle) {
    const shouldBeVisible = part.invertVisibility ? !isActive : isActive;
    if (!shouldBeVisible) {
      return <></>;
    }
  }

  return (
    <group ref={meshRef}>
      <mesh receiveShadow castShadow geometry={geometry} material={material} />
    </group>
  );
}
