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

  console.log(
    `🎥 Camera Config: position=[${defaultCamera.position.join(', ')}], fov=${defaultCamera.fov}`,
  );

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
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.8} />
      <spotLight
        intensity={0.8}
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
        position={[0, shadowConfig?.position ?? -0.8, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Ground shadow */}
      <ContactShadows
        position={[0, (shadowConfig?.position ?? -0.8) + 0.01, 0]}
        opacity={shadowConfig?.opacity ?? 0.4}
        scale={shadowConfig?.scale ?? 10}
        blur={shadowConfig?.blur ?? 2}
        far={1.5}
      />

      {/* Camera controls */}
      <OrbitControls
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        enableZoom={true}
        enablePan={false}
      />
    </Canvas>
  );
}
