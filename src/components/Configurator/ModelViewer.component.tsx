import { CABINET_CONFIG } from '@/config/cabinetModel.config';
import { configuratorState, setCurrentPart } from '@/stores/configuratorStore';
import type { ModelConfig } from '@/types/configurator';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useCallback, useRef, useState, type ReactElement } from 'react';
import type { Group } from 'three';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';
import InteractiveMesh from './InteractiveMesh.component';

interface ModelViewerProps {
  modelPath?: string;
  modelConfig?: ModelConfig;
}

/**
 * 3D Model viewer component with interactive material customization
 * Handles model loading, animation, and part selection
 */
export default function ModelViewer({
  modelPath,
  modelConfig = CABINET_CONFIG,
}: ModelViewerProps): ReactElement {
  // Use modelPath from config if not explicitly provided
  const resolvedModelPath = modelPath || modelConfig.modelPath;
  const ref = useRef<Group>(null);
  const snap = useSnapshot(configuratorState);
  const { nodes, materials } = useGLTF(resolvedModelPath) as any;

  // State to track bounding box and calculated depth offset
  const [boundingBoxZ, setBoundingBoxZ] = useState<{
    min: number;
    max: number;
  } | null>(null);

  // Animate the model with gentle rotation and bobbing (if enabled)
  useFrame((state) => {
    if (!ref.current) return;

    const animations = modelConfig.animations;

    // Only apply animations if enabled
    if (!animations?.enableRotation && !animations?.enableBobbing) {
      return; // Skip animation frame entirely if both are disabled
    }

    const t = state.clock.getElapsedTime();

    // Apply rotation animation if enabled
    if (animations?.enableRotation) {
      const speed = animations.rotationSpeed ?? 1;
      ref.current.rotation.set(
        Math.cos(t / 4 / speed) / 8,
        Math.sin(t / 4 / speed) / 8,
        -0.2 - (1 + Math.sin(t / 1.5 / speed)) / 20,
      );
    }

    // Apply bobbing animation if enabled
    if (animations?.enableBobbing) {
      const amplitude = animations.bobbingAmplitude ?? 0.1;
      ref.current.position.y =
        (modelConfig.position?.[1] ?? 0) + (1 + Math.sin(t / 1.5)) * amplitude;
    }
  });

  // Handle pointer events
  const handlePointerMissed = useCallback((): void => {
    setCurrentPart(null);
  }, []);

  const handleClick = useCallback((e: any): void => {
    e.stopPropagation();
    setCurrentPart(e.object.material.name);
  }, []);

  // Calculate bounding box on model load to determine rear face position
  useFrame((_state) => {
    if (!ref.current || boundingBoxZ) return; // Only calculate once

    const box = new THREE.Box3().setFromObject(ref.current);

    if (!box.isEmpty()) {
      setBoundingBoxZ({
        min: box.min.z,
        max: box.max.z,
      });

      console.log(
        `📦 Bounding Box Z: [${box.min.z.toFixed(3)}, ${box.max.z.toFixed(3)}] (Depth: ${(box.max.z - box.min.z).toFixed(3)})`,
      );
    }
  });

  // Calculate scale from dimensions (if configured)
  const baseScale = modelConfig.scale ?? 1;
  let finalScale: [number, number, number] = [baseScale, baseScale, baseScale];
  let depthZOffset = 0; // Offset to keep rear face flush with wall

  if (modelConfig.dimensions) {
    // Convert cm dimensions to scale factors relative to defaults
    const scaleX = snap.dimensions.width / modelConfig.dimensions.width.default;
    const scaleY =
      snap.dimensions.height / modelConfig.dimensions.height.default;
    const scaleZ = snap.dimensions.depth / modelConfig.dimensions.depth.default;

    finalScale = [baseScale * scaleX, baseScale * scaleY, baseScale * scaleZ];

    // Calculate depth offset using bounding box
    // This keeps the rear face of the model flush with the wall
    // while allowing depth to expand only forward (toward camera)
    if (boundingBoxZ && scaleZ !== 1) {
      // Original model depth in 3D space
      const originalDepth = boundingBoxZ.max - boundingBoxZ.min;

      // How much the depth changed
      const depthChange = originalDepth * (scaleZ - 1);

      // Offset position so rear face stays fixed
      // Only move forward by half the depth increase
      depthZOffset = depthChange / 2;
    }
  }

  // Calculate final position with depth offset applied
  const basePosition = modelConfig.position ?? [0, 0, 0];
  const finalPosition: [number, number, number] = [
    basePosition[0],
    basePosition[1],
    basePosition[2] + depthZOffset,
  ];

  return (
    <group
      ref={ref}
      scale={finalScale}
      position={finalPosition}
      onPointerMissed={handlePointerMissed}
      onClick={handleClick}
    >
      {/* Regular customizable parts */}
      {modelConfig.parts.map((part, index) => {
        const node = nodes[part.nodeName];
        const material = materials[part.materialName];

        // Skip if node or material doesn't exist
        if (!node?.geometry || !material) {
          console.warn(
            `Missing node or material for part: ${part.displayName}`,
          );
          return null;
        }

        return (
          <mesh
            key={`${part.nodeName}-${index}`}
            receiveShadow
            castShadow
            geometry={node.geometry}
            material={material}
            material-color={snap.items[part.materialName]}
            material-map={null}
            material-roughness={0.6}
            material-metalness={0.1}
          />
        );
      })}

      {/* Interactive parts (doors, drawers, etc.) */}
      {modelConfig.interactiveParts?.map((part, index) => {
        const node = nodes[part.nodeName];
        const material = materials[part.materialName];

        // Skip if node or material doesn't exist
        if (!node?.geometry || !material) {
          console.warn(
            `Missing interactive node or material for part: ${part.displayName}`,
          );
          return null;
        }

        return (
          <InteractiveMesh
            key={`interactive-${part.nodeName}-${index}`}
            part={part}
            geometry={node.geometry}
            material={material}
          />
        );
      })}
    </group>
  );
}

// Preload the default model for better performance
useGLTF.preload(CABINET_CONFIG.modelPath);
