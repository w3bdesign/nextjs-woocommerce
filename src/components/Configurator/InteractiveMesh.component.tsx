import { configuratorState } from '@/stores/configuratorStore';
import type { InteractivePart } from '@/types/configurator';
import { type ReactElement } from 'react';
import { useSnapshot } from 'valtio';

interface InteractiveMeshProps {
  part: InteractivePart;
  geometry: any;
  material: any;
}

/**
 * Simplified interactive mesh component
 * Handles visibility toggling based on state (e.g., door open/closed)
 */
export default function InteractiveMesh({
  part,
  geometry,
  material,
}: InteractiveMeshProps): ReactElement | null {
  const snap = useSnapshot(configuratorState);

  // Use stateKey if provided, otherwise fall back to nodeName
  const stateKey = part.stateKey || part.nodeName;
  const isActive = snap.interactiveStates[stateKey] ?? part.defaultState;

  // Determine visibility based on state and configuration
  const shouldBeVisible = isActive
    ? part.visibleWhenActive
    : !part.visibleWhenActive;

  // Return null if part should be hidden
  if (!shouldBeVisible) {
    return null;
  }

  return (
    <mesh receiveShadow castShadow geometry={geometry} material={material} />
  );
}
