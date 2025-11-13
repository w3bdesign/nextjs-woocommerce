'use client';
import type { CameraConfig } from '@/types/configurator';
import { Environment } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { ReactNode } from 'react';
import * as THREE from 'three';
import CameraController from './CameraController.component';
import WallSilhouette from './WallSilhouette.component';

/**
 * Default room configuration for the 3D scene
 * Modern studio aesthetic with neutral colors and balanced lighting
 */
const DEFAULT_ROOM_CONFIG = {
  floorColor: '#e0ddd8',
  wallColor: '#e8e8e8',
  ambientLightIntensity: 2.8,
  directionalLightIntensity: 5.5,
  directionalLightPosition: [2, 6, 2] as [number, number, number],
  secondaryLightIntensity: 0.8,
  secondaryLightPosition: [-5, 3, -5] as [number, number, number],
  environmentPreset: 'none' as const,
  wallDepth: -3,
  floorRoughness: 0.8,
  wallRoughness: 0.9,
};

interface Canvas3DProps {
  children: ReactNode;
  /**
   * Canvas receives only explicit camera configuration. Avoid passing the
   * full model configuration into the environment component to prevent
   * implicit model->environment coupling.
   */
  cameraConfig?: CameraConfig;
}

/**
 * Main 3D Canvas component with lighting and controls
 * Uses Next.js dynamic import to avoid SSR issues
 */
export default function Canvas3D({
  children,
  cameraConfig,
}: Canvas3DProps): ReactNode {
  const defaultCamera = cameraConfig || { position: [0, 0, 4], fov: 45 };
  const room = DEFAULT_ROOM_CONFIG;

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
        background: room.wallColor,
        width: '100%',
        height: '100%',
        cursor: 'pointer',
      }}
    >
      {/* Lighting setup */}
      <ambientLight intensity={room.ambientLightIntensity} />
      <directionalLight
        position={room.directionalLightPosition}
        intensity={room.directionalLightIntensity}
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
        position={room.secondaryLightPosition}
        intensity={room.secondaryLightIntensity}
      />
      <spotLight
        intensity={1}
        angle={0.3}
        penumbra={1}
        position={[0, 10, 0]}
        castShadow
      />

      {/* Environment for realistic reflections */}
      {room.environmentPreset !== 'none' && (
        <Environment preset={room.environmentPreset} />
      )}

      {/* Render the 3D model */}
      {children}

      {/* Ground plane for visual reference (fixed at Y = 0 to keep environment
          independent from model/configuration changes). */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color={room.floorColor}
          roughness={room.floorRoughness}
          metalness={0.1}
        />
      </mesh>

      {/* Back wall for visual context */}
      <mesh position={[0, 1.5, room.wallDepth ?? -3]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial
          color={room.wallColor}
          roughness={room.wallRoughness}
          metalness={0}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Wall Silhouette for depth and context */}
      <WallSilhouette
        imagePath="/silhouettes/person.png"
        positionX={1.2}
        positionY={1.45}
        positionZ={room.wallDepth ? room.wallDepth + 0.05 : -2.95}
        scale={3.6}
        opacity={0.15}
      />

      {/* Camera controls - Enhanced with preset system */}
      <CameraController cameraConfig={cameraConfig} />
    </Canvas>
  );
}
export {};
