import type { ReactElement } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import type { ShadowConfig, CameraConfig } from '@/types/configurator';
import { useEffect } from 'react';

interface Canvas3DProps {
  children: ReactElement;
  shadowConfig?: ShadowConfig;
  cameraConfig?: CameraConfig;
}

/**
 * Debug component to log camera position on changes
 */
function CameraDebug(): null {
  const { camera } = useThree();

  useEffect(() => {
    const handleChange = () => {
      console.log(
        `Camera Position: [${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}]`,
      );
    };

    // Log initial position
    handleChange();

    // Log on every frame to catch OrbitControls changes
    const interval = setInterval(handleChange, 500);

    return () => clearInterval(interval);
  }, [camera]);

  return null;
}

/**
 * Main 3D Canvas component with lighting and controls
 * Uses Next.js dynamic import to avoid SSR issues
 */
export default function Canvas3D({
  children,
  shadowConfig,
  cameraConfig,
}: Canvas3DProps): ReactElement {
  const defaultCamera = cameraConfig || { position: [0, 0, 4], fov: 45 };

  return (
    <Canvas
      shadows
      camera={{ position: defaultCamera.position, fov: defaultCamera.fov }}
      style={{
        background: 'white',
        width: '100%',
        height: '100%',
        cursor: 'pointer',
      }}
    >
      {/* Lighting setup */}
      <ambientLight intensity={2.8} />
      <directionalLight
        position={[2, 6, 2]}
        intensity={5.5}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.8} />
      <spotLight
        intensity={1}
        angle={0.3}
        penumbra={1}
        position={[0, 10, 0]}
        castShadow
      />

      {/* Environment for realistic reflections */}
      <Environment preset="city" />

      {/* Debug camera position logging */}
      <CameraDebug />

      {/* Render the 3D model */}
      {children}

      {/* Ground plane for visual reference */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, shadowConfig?.position ?? -1.3, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#d0d0d0" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Camera controls */}
      <OrbitControls
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        enableZoom={true}
        enablePan={true}
        target={[0, 0.2, 0]}
      />
    </Canvas>
  );
}
