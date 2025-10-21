import type { ReactElement } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import type { ShadowConfig } from '@/types/configurator';

interface Canvas3DProps {
  children: ReactElement;
  shadowConfig?: ShadowConfig;
}

/**
 * Main 3D Canvas component with lighting and controls
 * Uses Next.js dynamic import to avoid SSR issues
 */
export default function Canvas3D({ children, shadowConfig }: Canvas3DProps): ReactElement {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 4], fov: 45 }}
      style={{ 
        background: 'white',
        width: '100%',
        height: '100%'
      }}
    >
      {/* Lighting setup */}
      <ambientLight intensity={0.7} />
      <spotLight
        intensity={0.5}
        angle={0.1}
        penumbra={1}
        position={[10, 15, 10]}
        castShadow
      />

      {/* Environment for realistic reflections */}
      <Environment preset="city" />

      {/* Render the 3D model */}
      {children}

      {/* Ground plane for visual reference */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, shadowConfig?.position ?? -0.8, 0]}
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#f5f5f5" 
          roughness={0.8}
          metalness={0.1}
        />
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
