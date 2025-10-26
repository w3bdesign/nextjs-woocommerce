'use client';
import type {
  CameraConfig,
  ModelConfig,
  RoomConfig,
} from '@/types/configurator';
import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import * as THREE from 'three';
import CameraController from './CameraController.component';
import WallSilhouette from './WallSilhouette.component';

/**
 * Default room presets for different aesthetic styles
 */
const ROOM_PRESETS: Record<string, RoomConfig> = {
  'modern-studio': {
    id: 'modern-studio',
    name: 'Modern Studio',
    floorColor: '#e0ddd8',
    wallColor: '#e8e8e8',
    ambientLightIntensity: 2.8,
    directionalLightIntensity: 5.5,
    directionalLightPosition: [2, 6, 2],
    secondaryLightIntensity: 0.8,
    secondaryLightPosition: [-5, 3, -5],
    environmentPreset: 'none',
    wallDepth: -3,
    floorRoughness: 0.8,
    wallRoughness: 0.9,
  },
  'bright-minimal': {
    id: 'bright-minimal',
    name: 'Bright Minimal',
    floorColor: '#f5f5f5',
    wallColor: '#fafafa',
    ambientLightIntensity: 3.2,
    directionalLightIntensity: 4.5,
    directionalLightPosition: [3, 7, 3],
    secondaryLightIntensity: 1.2,
    secondaryLightPosition: [-4, 4, -4],
    environmentPreset: 'apartment',
    wallDepth: -3.5,
    floorRoughness: 0.7,
    wallRoughness: 0.85,
  },
  'warm-ambient': {
    id: 'warm-ambient',
    name: 'Warm Ambient',
    floorColor: '#d4c9c1',
    wallColor: '#ede8e3',
    ambientLightIntensity: 2.5,
    directionalLightIntensity: 6,
    directionalLightPosition: [2.5, 6.5, 2.5],
    secondaryLightIntensity: 1,
    secondaryLightPosition: [-5, 3, -5],
    environmentPreset: 'warehouse',
    wallDepth: -3,
    floorRoughness: 0.85,
    wallRoughness: 0.88,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    floorColor: '#cccccc',
    wallColor: '#e0e0e0',
    ambientLightIntensity: 3,
    directionalLightIntensity: 5,
    directionalLightPosition: [2, 6, 2],
    secondaryLightIntensity: 1.2,
    secondaryLightPosition: [-5, 3, -5],
    environmentPreset: 'city',
    wallDepth: -3.2,
    floorRoughness: 0.75,
    wallRoughness: 0.82,
  },
};

interface Canvas3DProps {
  children: ReactNode;
  /**
   * Canvas receives only explicit camera configuration. Avoid passing the
   * full model configuration into the environment component to prevent
   * implicit model->environment coupling.
   */
  cameraConfig?: CameraConfig;
  roomPreset?: keyof typeof ROOM_PRESETS;
}

/**
 * Main 3D Canvas component with lighting and controls
 * Uses Next.js dynamic import to avoid SSR issues
 */
export default function Canvas3D({
  children,
  cameraConfig,
  roomPreset = 'modern-studio',
}: Canvas3DProps): ReactNode {
  const defaultCamera = cameraConfig || { position: [0, 0, 4], fov: 45 };
  const room = ROOM_PRESETS[roomPreset];

  if (!room) {
    console.warn(
      `Room preset "${roomPreset}" not found. Using "modern-studio" as default.`,
    );
  }

  const activeRoom = room || ROOM_PRESETS['modern-studio'];

  return (
    <Canvas
      shadows
      camera={{
        position: defaultCamera.position,
        fov: defaultCamera.fov,
        near: defaultCamera.near ?? 0.1,
        far: defaultCamera.far ?? 1000,
      }}
      style={{
        background: activeRoom.wallColor,
        width: '100%',
        height: '100%',
        cursor: 'pointer',
      }}
    >
      {/* Lighting setup */}
      <ambientLight intensity={activeRoom.ambientLightIntensity} />
      <directionalLight
        position={activeRoom.directionalLightPosition}
        intensity={activeRoom.directionalLightIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={activeRoom.secondaryLightPosition}
        intensity={activeRoom.secondaryLightIntensity}
      />
      <spotLight
        intensity={1}
        angle={0.3}
        penumbra={1}
        position={[0, 10, 0]}
        castShadow
      />

      {/* Environment for realistic reflections */}
      {activeRoom.environmentPreset !== 'none' && (
        <Environment preset={activeRoom.environmentPreset} />
      )}

      {/* Render the 3D model */}
      {children}

      {/* Ground plane for visual reference (fixed at Y = 0 to keep environment
          independent from model/configuration changes). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color={activeRoom.floorColor}
          roughness={activeRoom.floorRoughness}
          metalness={0.1}
        />
      </mesh>

      {/* Back wall for visual context */}
      <mesh position={[0, 1.5, activeRoom.wallDepth ?? -3]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color={activeRoom.wallColor}
          roughness={activeRoom.wallRoughness}
          metalness={0}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Wall Silhouette for depth and context */}
      <WallSilhouette
        imagePath="/silhouettes/person.png"
        positionX={1.2}
        positionY={1.45}
        positionZ={activeRoom.wallDepth ? activeRoom.wallDepth + 0.05 : -2.95}
        scale={3.6}
        opacity={0.15}
      />

      {/* Camera controls - Enhanced with preset system */}
      <CameraController cameraConfig={cameraConfig} />
    </Canvas>
  );
}

// Warn in development if modelConfig is missing
function useMissingModelConfigWarning(modelConfig?: ModelConfig) {
  useEffect(() => {
    if (!modelConfig && process.env.NODE_ENV === 'development') {
      console.warn(
        'Canvas3D: modelConfig not provided. Using basic OrbitControls without camera presets.',
      );
    }
  }, [modelConfig]);
}

export { useMissingModelConfigWarning };
