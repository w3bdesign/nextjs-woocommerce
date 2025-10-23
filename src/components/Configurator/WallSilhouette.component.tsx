import { useTexture } from '@react-three/drei';
import type { ReactElement } from 'react';
import * as THREE from 'three';

interface WallSilhouetteProps {
  /** Path to the silhouette image */
  imagePath: string;
  /** X position on the wall (left/right) */
  positionX?: number;
  /** Y position (height) */
  positionY?: number;
  /** Z position (depth on wall) */
  positionZ?: number;
  /** Scale of the silhouette */
  scale?: number;
  /** Opacity of the silhouette (0-1) */
  opacity?: number;
}

/**
 * Wall Silhouette Component
 * Renders a silhouette image on the back wall for context and depth
 * Optimized for tall portrait silhouettes (height > width)
 */
export default function WallSilhouette({
  imagePath,
  positionX = 0,
  positionY = 0,
  positionZ = 0,
  scale = 1,
  opacity = 1,
}: WallSilhouetteProps): ReactElement {
  const texture = useTexture(imagePath);

  return (
    <mesh
      position={[positionX, positionY, positionZ]}
      scale={[scale, scale, 1]}
      receiveShadow
    >
      <planeGeometry args={[1, 1]} /> {/* Standard portrait aspect ratio */}
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={opacity}
        metalness={0}
        roughness={1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
