import { CABINET_CONFIG } from '@/config/cabinetModel.config';
import { getModelFamily } from '@/config/families.registry';
import { MODEL_REGISTRY } from '@/config/models.registry';
import { configuratorState, setCurrentPart } from '@/stores/configuratorStore';
import { setModelWorld } from '@/stores/sceneMediatorStore';
import type { ModelConfig } from '@/types/configurator';
import debug from '@/utils/debug';
import { useGLTF } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import type { Group } from 'three';
import * as THREE from 'three';
import { useSnapshot } from 'valtio';

interface ModelViewerProps {
  modelPath?: string;
  modelConfig?: ModelConfig;
}

/**
 * 3D Model viewer component with interactive material customization
 * Handles model loading, animation, and part selection
 *
 * Supports family-based variant system:
 * - Reads from preloaded model cache (configuratorState.preloadedModels)
 * - Uses activeVariantId to determine which model to display
 * - Applies scalableAxes constraints from variant config
 */
export default function ModelViewer({
  modelPath,
  modelConfig = CABINET_CONFIG,
}: ModelViewerProps): ReactElement {
  const ref = useRef<Group>(null);
  const snap = useSnapshot(configuratorState);

  // Debug logging
  debug.log(
    `[ModelViewer] Render:\n` +
      `  activeVariantId: ${snap.activeVariantId}\n` +
      `  modelConfig: ${modelConfig ? 'present' : 'MISSING'}\n` +
      `  modelConfig.name: ${modelConfig?.name || 'N/A'}\n` +
      `  preloadedModels count: ${Object.keys(configuratorState.preloadedModels).length}`,
  );

  // Get active variant's model path
  const activeFamily = snap.familyId ? getModelFamily(snap.familyId) : null;
  const activeVariant = activeFamily?.variants.find(
    (v) => v.id === snap.activeVariantId,
  );
  const activeModelConfig = activeVariant
    ? MODEL_REGISTRY[activeVariant.modelId]
    : null;
  const currentModelPath =
    activeModelConfig?.modelPath || modelPath || modelConfig.modelPath;

  // Use the active variant's model config if available, otherwise fall back to prop
  const effectiveModelConfig = activeModelConfig || modelConfig;

  if (process.env.NODE_ENV === 'development') {
    debug.log(
      `[ModelViewer] Model path resolution:\n` +
        `  activeVariantId: ${snap.activeVariantId}\n` +
        `  activeVariant.modelId: ${activeVariant?.modelId}\n` +
        `  activeModelConfig: ${activeModelConfig ? 'found' : 'NOT FOUND'}\n` +
        `  currentModelPath: ${currentModelPath}\n` +
        `  effectiveModelConfig.scale: ${effectiveModelConfig.scale}`,
    );
  }

  // Use drei's useGLTF which handles texture loading properly
  // This prevents "Illegal invocation" errors with texture uploads
  // Extract nodes and materials like master branch (no scene cloning needed)
  const { nodes, materials } = useGLTF(currentModelPath) as any;

  // Get scalableAxes from active variant (already defined above)
  const scalableAxes = activeVariant?.scalableAxes || ['x', 'y', 'z']; // Default all axes

  // State to track bounding box (full) and calculated depth offset
  const [boundingBox, setBoundingBox] = useState<{
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  } | null>(null);

  // Animate the model with gentle rotation and bobbing (if enabled)
  useFrame((state) => {
    if (!ref.current) return;

    const animations = effectiveModelConfig.animations;

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
        (effectiveModelConfig.position?.[1] ?? 0) +
        (1 + Math.sin(t / 1.5)) * amplitude;
    }
  });

  // Handle pointer events
  const handlePointerMissed = useCallback((): void => {
    setCurrentPart(null);
  }, []);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation();
    // Type guard to ensure object is a Mesh with material
    if ('material' in e.object && e.object.material) {
      const material = e.object.material as THREE.Material;
      if ('name' in material) {
        setCurrentPart(material.name);
      }
    }
  }, []);

  // Calculate bounding box on model load to determine rear face position
  // and to compute a ground-snap offset so the model's lowest vertex
  // aligns with the configured base Y (modelConfig.position[1]).
  useFrame((_state) => {
    if (!ref.current || boundingBox) return; // Only calculate once

    const box = new THREE.Box3().setFromObject(ref.current);

    if (!box.isEmpty()) {
      const bbox = {
        min: { x: box.min.x, y: box.min.y, z: box.min.z },
        max: { x: box.max.x, y: box.max.y, z: box.max.z },
      };

      setBoundingBox(bbox);

      // We keep the computed bounding box locally for Y/Z depth calculations
      // and publish a final world-aligned version to the configurator store
      // so other UI components (e.g., Canvas3D) can position overlays.
      const geometryHeight = box.max.y - box.min.y;
      const finalMinY = basePosition[1];
      const finalMaxY = finalMinY + geometryHeight;

      const geometryWidth = box.max.x - box.min.x;
      const geometryDepth = box.max.z - box.min.z;

      const finalMinX = basePosition[0] - geometryWidth / 2;
      const finalMaxX = finalMinX + geometryWidth;
      const finalMinZ = basePosition[2] - geometryDepth / 2;
      const finalMaxZ = finalMinZ + geometryDepth;

      // Publish a world-aligned bounding box + base position to the scene
      // mediator. This keeps environment-facing information separate from
      // configurator-specific state (colors/dimensions) and enables camera
      // and overlays to react without allowing configuration actions to
      // mutate the environment.
      setModelWorld(
        {
          min: { x: finalMinX, y: finalMinY, z: finalMinZ },
          max: { x: finalMaxX, y: finalMaxY, z: finalMaxZ },
        },
        basePosition as [number, number, number],
        effectiveModelConfig.scale ?? 1,
      );

      debug.category(
        '3D',
        `📦 Bounding Box Z: [${box.min.z.toFixed(3)}, ${box.max.z.toFixed(3)}] (Depth: ${(box.max.z - box.min.z).toFixed(3)})`,
      );
      debug.category(
        '3D',
        `📦 Bounding Box Y: [${box.min.y.toFixed(3)}, ${box.max.y.toFixed(3)}] (Height: ${(box.max.y - box.min.y).toFixed(3)})`,
      );
    }
  });

  // Recalculate bounding box when variant changes
  // This ensures camera presets adapt to new model dimensions
  useEffect(() => {
    if (!ref.current || !snap.activeVariantId) return;

    // Recompute bounding box for new variant
    const box = new THREE.Box3().setFromObject(ref.current);

    if (!box.isEmpty()) {
      // Update local bounding box state
      const bbox = {
        min: { x: box.min.x, y: box.min.y, z: box.min.z },
        max: { x: box.max.x, y: box.max.y, z: box.max.z },
      };
      setBoundingBox(bbox);

      // Publish world-aligned bounding box to scene mediator
      const geometryHeight = box.max.y - box.min.y;
      const finalMinY = basePosition[1];
      const finalMaxY = finalMinY + geometryHeight;

      const geometryWidth = box.max.x - box.min.x;
      const geometryDepth = box.max.z - box.min.z;

      const finalMinX = basePosition[0] - geometryWidth / 2;
      const finalMaxX = finalMinX + geometryWidth;
      const finalMinZ = basePosition[2] - geometryDepth / 2;
      const finalMaxZ = finalMinZ + geometryDepth;

      setModelWorld(
        {
          min: { x: finalMinX, y: finalMinY, z: finalMinZ },
          max: { x: finalMaxX, y: finalMaxY, z: finalMaxZ },
        },
        basePosition as [number, number, number],
        finalScale[0],
      );

      debug.category(
        '3D',
        `🔄 Variant switched - Bounding box recalculated for variant: ${snap.activeVariantId}`,
      );
    }
    // basePosition and finalScale are calculated later but used in rendering
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap.activeVariantId]);

  // Calculate scale from dimensions (if configured)
  const baseScale = effectiveModelConfig.scale ?? 1;
  let finalScale: [number, number, number] = [baseScale, baseScale, baseScale];
  let depthZOffset = 0; // Offset to keep rear face flush with wall

  if (effectiveModelConfig.dimensions) {
    // Convert cm dimensions to scale factors relative to defaults
    // WooCommerce standard: length (Z/depth), width (X/side-to-side), height (Y/vertical)
    const scaleX =
      snap.dimensions.width / effectiveModelConfig.dimensions.width.default;
    const scaleY =
      snap.dimensions.height / effectiveModelConfig.dimensions.height.default;
    const scaleZ =
      snap.dimensions.length / effectiveModelConfig.dimensions.length.default;

    // Apply scale only to axes specified in scalableAxes
    // If axis not in scalableAxes array, use baseScale (no scaling)
    finalScale = [
      scalableAxes.includes('x') ? baseScale * scaleX : baseScale,
      scalableAxes.includes('y') ? baseScale * scaleY : baseScale,
      scalableAxes.includes('z') ? baseScale * scaleZ : baseScale,
    ];

    // Calculate depth offset using bounding box
    // This keeps the rear face of the model flush with the wall
    // while allowing depth to expand only forward (toward camera)
    if (boundingBox && scaleZ !== 1) {
      // Original model depth in 3D space (use computed bounding box Z extents)
      const originalDepth = boundingBox.max.z - boundingBox.min.z;

      // How much the depth changed
      const depthChange = originalDepth * (scaleZ - 1);

      // Offset position so rear face stays fixed
      // Only move forward by half the depth increase
      depthZOffset = depthChange / 2;
    }
  }

  // Calculate final position with depth offset applied
  const basePosition = effectiveModelConfig.position ?? [0, 0, 0];
  // If we have a computed bounding box, adjust Y so the model's lowest
  // vertex (boundingBox.min.y) aligns with the base Y specified in the
  // model config (basePosition[1]). This makes models with differing
  // pivots behave consistently: the model's bottom will sit at the
  // configured base height.
  // finalY previously used to compute a derived final position; the outer
  // group intentionally keeps the basePosition as its Y so camera presets
  // and other systems remain stable. Inner geometry offset is computed
  // below (innerOffsetY) when a bounding box is available.

  // We wrap the actual geometry in an inner group so that the outer group's
  // position remains equal to `modelConfig.position`. Camera presets and
  // other systems that rely on the model position will therefore continue
  // to work correctly. The inner group is offset to perform the ground-snap
  // using the computed bounding box.
  const outerPosition: [number, number, number] = [
    basePosition[0],
    basePosition[1],
    basePosition[2] + depthZOffset,
  ];

  // Compute inner offset (so geometry.min.y ends up at basePosition[1])
  const innerOffsetY = boundingBox ? basePosition[1] - boundingBox.min.y : 0;

  // Cleanup Three.js resources on unmount to prevent memory leaks
  useEffect(() => {
    const currentRef = ref.current;
    return () => {
      if (!currentRef) return;

      debug.category('3D', '🧹 Cleaning up ModelViewer resources on unmount');

      // Traverse the scene and dispose all geometries, materials, and textures
      currentRef.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          // Dispose geometry
          if (object.geometry) {
            object.geometry.dispose();
          }

          // Dispose material(s)
          if (object.material) {
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];

            materials.forEach((material) => {
              // Dispose all texture types
              const textureProperties = [
                'map',
                'lightMap',
                'bumpMap',
                'normalMap',
                'specularMap',
                'envMap',
                'alphaMap',
                'aoMap',
                'displacementMap',
                'emissiveMap',
                'gradientMap',
                'metalnessMap',
                'roughnessMap',
              ];

              textureProperties.forEach((prop) => {
                if (material[prop]) {
                  material[prop].dispose();
                }
              });

              // Dispose the material itself
              material.dispose();
            });
          }
        }
      });
    };
  }, []);

  // Safety checks
  if (!effectiveModelConfig) {
    debug.error('ModelViewer: effectiveModelConfig is undefined');
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ff0000" wireframe />
        </mesh>
      </group>
    );
  }

  // InteractiveMesh component for doors/drawers with visibility control
  const InteractiveMesh = ({
    part,
    geometry,
    material,
  }: {
    part: any;
    geometry: THREE.BufferGeometry;
    material: THREE.Material;
  }) => {
    const isVisible = part.visibleWhenActive
      ? snap.interactiveStates[part.stateKey]
      : !snap.interactiveStates[part.stateKey];

    return (
      <mesh
        receiveShadow
        castShadow
        visible={isVisible}
        geometry={geometry}
        material={material}
        material-color={snap.items[part.materialName]}
      />
    );
  };

  return (
    <group
      position={outerPosition}
      rotation={effectiveModelConfig.rotation ?? [0, 0, 0]}
      onPointerMissed={handlePointerMissed}
      onClick={handleClick}
    >
      <group ref={ref} scale={finalScale} position={[0, innerOffsetY, 0]}>
        {/* Regular customizable parts */}
        {effectiveModelConfig.parts?.map((part, index) => {
          const node = nodes[part.nodeName];
          const material = materials[part.materialName];

          // Skip if node or material doesn't exist
          if (!node?.geometry || !material) {
            debug.warn(
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
            />
          );
        })}

        {/* Interactive parts (doors, drawers, etc.) */}
        {effectiveModelConfig.interactiveParts?.map((part, index) => {
          const node = nodes[part.nodeName];
          const material = materials[part.materialName];

          // Skip if node or material doesn't exist
          if (!node?.geometry || !material) {
            debug.warn(
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
    </group>
  );
}
