# Three.js Development Copilot Instructions

## OBJECTIVE

This agent assists developers with Three.js 3D web development integrated with React applications. It provides code suggestions, optimizations, and best practices for building performant, production-ready WebGL applications using React Three Fiber ecosystem. This file works in conjunction with the existing ReactJS instructions and defers to React patterns where applicable.

## GENERAL GUIDELINES

- Always prioritize performance and cross-platform compatibility
- Follow Mr.doob's Code Style™ for pure Three.js code
- Use **@react-three/fiber** and **@react-three/drei** for React integration (primary approach)
- Focus on reducing draw calls and optimizing GPU performance
- Provide clean, readable code with meaningful variable names
- Always include proper error handling and fallbacks
- Test suggestions against performance metrics (FPS, draw calls, memory usage)
- **Defer to ReactJS instructions for component structure, TypeScript, and React patterns**

## TECH STACK AND PROJECT STRUCTURE

### Core Three.js with React Integration

- Use **@react-three/fiber** (R3F) for declarative Three.js in React
- Use **@react-three/drei** for common 3D patterns and helpers
- Always wrap 3D scenes with React `Suspense` boundaries
- Use TypeScript for all components (as per ReactJS instructions)
- Import Three.js types: `import * as THREE from 'three'`
- Import R3F components: `import { Canvas, useFrame, useThree } from '@react-three/fiber'`

## PERFORMANCE OPTIMIZATION RULES

### Essential Performance Practices

1. **Minimize Draw Calls**: Target <100 draw calls for mobile, <300 for desktop
2. **Use Object Pooling**: Reuse geometries, materials, and textures
3. **Implement Frustum Culling**: Enabled by default in R3F, but be aware of it
4. **Use LOD (Level of Detail)**: Use `<Lod />` component from drei for distance-based optimization
5. **Optimize Textures**: Use power-of-two dimensions, compress with Draco
6. **Batch Similar Objects**: Use `<Instances />` from drei for repeated geometries
7. **Set matrixAutoUpdate = false** for static objects via props

### Memory Management

```typescript
// React Three Fiber handles disposal automatically
// But for manual cleanup in useEffect:
useEffect(() => {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial();

  return () => {
    geometry.dispose();
    material.dispose();
  };
}, []);

// Use drei's useGLTF for automatic caching and disposal
import { useGLTF } from '@react-three/drei';
const { scene } = useGLTF('/models/furniture.glb');
```

### Texture Optimization

- Use POT (Power of Two) dimensions: 256x256, 512x512, 1024x1024, etc.
- Use `useTexture` hook from drei for automatic loading and caching
- Use texture compression: Enable Draco for glTF models
- Minimize texture resolution while maintaining visual quality
- Reuse textures across multiple materials when possible
- Use `preload` from drei to preload critical assets

## CODING STANDARDS FOR REACT THREE FIBER

### Component Structure (React Patterns Take Precedence)

```typescript
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MeshProps {
    position?: [number, number, number];
    color?: string;
}

export const RotatingBox: React.FC<MeshProps> = ({
    position = [0, 0, 0],
    color = '#ffffff'
}) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta;
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};
```

### TypeScript with React Three Fiber

```typescript
// Type props properly
interface ModelProps {
  modelPath: string;
  scale?: number;
  onSelect?: (part: string) => void;
}

// Use proper Three.js types for refs
const meshRef = useRef<THREE.Mesh>(null);
const groupRef = useRef<THREE.Group>(null);

// Type useFrame properly
useFrame((state: RootState, delta: number) => {
  // Animation logic
});
```

## REACT THREE FIBER BEST PRACTICES

### Canvas Setup

```tsx
import { Canvas } from '@react-three/fiber';

export const Scene: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [2, 2, 2], fov: 75 }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      dpr={[1, 2]} // Adaptive pixel ratio
    >
      <Suspense fallback={<Loader />}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
};
```

### Model Loading with Hooks

```typescript
import { useGLTF } from '@react-three/drei';

interface FurnitureModelProps {
    modelPath: string;
}

export const FurnitureModel: React.FC<FurnitureModelProps> = ({ modelPath }) => {
    const { scene, materials } = useGLTF(modelPath);

    // Preload model for better performance
    return <primitive object={scene.clone()} />;
};

// Preload outside component
useGLTF.preload('/models/furniture.glb');
```

### Animation with useFrame

```typescript
import { useFrame } from '@react-three/fiber';

export const AnimatedModel: React.FC = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Frame-rate independent animation
        meshRef.current.rotation.y += delta * 0.5;
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry />
            <meshStandardMaterial />
        </mesh>
    );
};
```

### Lighting Setup with Drei

```tsx
import { Environment, ContactShadows } from '@react-three/drei';

export const Lights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <Environment preset="studio" />
      <ContactShadows position={[0, -1, 0]} opacity={0.5} blur={2} />
    </>
  );
};
```

### Interactive 3D Objects

```typescript
interface InteractiveMeshProps {
    onPartClick: (partName: string) => void;
    partName: string;
}

export const InteractiveMesh: React.FC<InteractiveMeshProps> = ({
    onPartClick,
    partName
}) => {
    const [hovered, setHovered] = useState(false);

    return (
        <mesh
            onClick={() => onPartClick(partName)}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
        >
            <boxGeometry />
            <meshStandardMaterial
                color={hovered ? '#ff6b6b' : '#4ecdc4'}
            />
        </mesh>
    );
};
```

## STATE MANAGEMENT FOR 3D CONFIGURATOR

### Zustand Store for Configurator State

```typescript
import { create } from 'zustand';

interface ConfiguratorState {
  selectedMaterial: string;
  selectedPart: string | null;
  materials: Record<string, THREE.Material>;
  setSelectedMaterial: (material: string) => void;
  setSelectedPart: (part: string | null) => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  selectedMaterial: 'wood',
  selectedPart: null,
  materials: {},
  setSelectedMaterial: (material) => set({ selectedMaterial: material }),
  setSelectedPart: (part) => set({ selectedPart: part }),
}));
```

### Custom Hook for 3D Interaction

```typescript
import { useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';

export const use3DInteraction = () => {
  const { camera, raycaster } = useThree();
  const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>(
    null,
  );

  const handleClick = useCallback((event: MouseEvent) => {
    // Click handling logic
  }, []);

  return { hoveredObject, handleClick };
};
```

## COMMON WORKFLOWS

### Configurator Setup Workflow

1. **Initialize Canvas with Suspense**
   - Wrap entire 3D scene in Canvas
   - Add Suspense boundary with loading fallback
   - Configure camera and renderer settings

2. **Load 3D Models**
   - Use `useGLTF` hook from drei
   - Preload critical models with `useGLTF.preload()`
   - Handle model errors gracefully

3. **Implement Part Selection**
   - Traverse model scene to identify parts
   - Add click handlers to meshes
   - Update Zustand store on selection
   - Sync UI with 3D state

4. **Material Swapping**
   - Store materials in Zustand store
   - Create material variants (wood, metal, fabric)
   - Apply materials to selected parts dynamically
   - Optimize by reusing material instances

### Performance Debugging Workflow

1. **Monitor with R3F DevTools**: Use `@react-three/fiber` debugger
2. **Track Render Info**: Access via `renderer.info` in useThree
3. **Profile with React DevTools**: Identify unnecessary re-renders
4. **Test on Mobile**: Use Chrome DevTools device emulation

## ERROR HANDLING AND DEBUGGING

### Error Boundaries for 3D Content

```tsx
import { ErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center h-full">
    <p>Failed to load 3D scene: {error.message}</p>
  </div>
);

export const Scene3D: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Canvas>
        <Suspense fallback={<LoadingSpinner />}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
};
```

### Model Loading Error Handling

```typescript
import { useGLTF } from '@react-three/drei';

export const SafeModel: React.FC<{ path: string }> = ({ path }) => {
    try {
        const { scene } = useGLTF(path);
        return <primitive object={scene} />;
    } catch (error) {
        console.error('Model loading failed:', error);
        return <FallbackMesh />;
    }
};
```

## EXAMPLES

### Complete Configurator Component

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';
import { useConfiguratorStore } from '@/stores/configuratorStore';

const FurnitureModel: React.FC = () => {
  const { scene } = useGLTF('/models/chair.glb');
  const selectedMaterial = useConfiguratorStore((s) => s.selectedMaterial);

  return <primitive object={scene} />;
};

export const Configurator: React.FC = () => {
  return (
    <div className="h-screen w-full">
      <Canvas camera={{ position: [2, 2, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <FurnitureModel />
          <OrbitControls enableDamping />
          <Environment preset="apartment" />
        </Suspense>
      </Canvas>
    </div>
  );
};
```

## INTEGRATION WITH REACT PATTERNS

- **Component Structure**: Follow React functional component patterns from ReactJS instructions
- **TypeScript**: Use strict typing as defined in ReactJS instructions
- **State Management**: Use Zustand for 3D state, following patterns from ReactJS instructions
- **Styling**: Use Tailwind CSS for UI overlays, defer to ReactJS instructions
- **Testing**: Use React Testing Library and Playwright as per ReactJS instructions
- **Error Handling**: Implement Error Boundaries following ReactJS patterns

## DEFINITIONS

- **R3F**: React Three Fiber - React renderer for Three.js
- **Drei**: Collection of useful helpers for React Three Fiber
- **Draw Call**: GPU instruction to render geometry; fewer is better for performance
- **Frustum**: Camera's viewing volume; objects outside are culled from rendering
- **LOD**: Level of Detail system for reducing polygon count based on distance
- **PBR**: Physically Based Rendering for realistic material appearance
- **Instancing**: Rendering technique for efficiently drawing multiple copies of the same geometry
- **Draco**: Google's geometry compression library for reducing file sizes
- **useFrame**: R3F hook that runs on every rendered frame for animations
- **useThree**: R3F hook to access Three.js renderer, scene, and camera
