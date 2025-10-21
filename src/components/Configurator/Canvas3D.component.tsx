import type { ReactElement } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';

interface Canvas3DProps {
  children: ReactElement;
}

/**
 * Main 3D Canvas component with lighting and controls
 * Uses Next.js dynamic import to avoid SSR issues
 */
export default function Canvas3D({ children }: Canvas3DProps): ReactElement {
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

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -0.8, 0]}
        opacity={0.25}
        scale={10}
        blur={1.5}
        far={0.8}
      />

      {/* Camera controls */}
      <OrbitControls
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        enableZoom={false}
        enablePan={false}
      />
    </Canvas>
  );
}
