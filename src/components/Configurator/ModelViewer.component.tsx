import { useRef, useState, useEffect, type ReactElement } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useSnapshot } from 'valtio';
import type { Group } from 'three';
import { configuratorState, setCurrentPart } from '@/stores/configuratorStore';
import type { ModelConfig } from '@/types/configurator';
import { SHOE_CONFIG } from '@/config/shoeModel.config';
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
  modelConfig = SHOE_CONFIG
}: ModelViewerProps): ReactElement {
  // Use modelPath from config if not explicitly provided
  const resolvedModelPath = modelPath || modelConfig.modelPath;
  const ref = useRef<Group>(null);
  const snap = useSnapshot(configuratorState);
  const { nodes, materials } = useGLTF(resolvedModelPath) as any;
  const [hovered, setHovered] = useState<string | null>(null);

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
        -0.2 - (1 + Math.sin(t / 1.5 / speed)) / 20
      );
    }
    
    // Apply bobbing animation if enabled
    if (animations?.enableBobbing) {
      const amplitude = animations.bobbingAmplitude ?? 0.1;
      ref.current.position.y = (modelConfig.position?.[1] ?? 0) + (1 + Math.sin(t / 1.5)) * amplitude;
    }
  });

  // Custom cursor for hovered parts
  useEffect(() => {
    const cursor = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><g filter="url(#filter0_d)"><path d="M29.5 47C39.165 47 47 39.165 47 29.5S39.165 12 29.5 12 12 19.835 12 29.5 19.835 47 29.5 47z" fill="${snap.items[hovered ?? '']}"/></g><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/><text fill="#000" style="white-space:pre" font-family="Inter var, sans-serif" font-size="10" letter-spacing="-.01em"><tspan x="35" y="63">${hovered}</tspan></text></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h64v64H0z"/></clipPath><filter id="filter0_d" x="6" y="8" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="2"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`;
    const auto = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></svg>`;
    
    if (hovered) {
      document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(cursor)}'), auto`;
      return () => {
        document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(auto)}'), auto`;
      };
    }
  }, [hovered, snap.items]);

  // Handle pointer events
  const handlePointerOver = (e: any): void => {
    e.stopPropagation();
    setHovered(e.object.material.name);
  };

  const handlePointerOut = (e: any): void => {
    if (e.intersections.length === 0) {
      setHovered(null);
    }
  };

  const handlePointerMissed = (): void => {
    setCurrentPart(null);
  };

  const handleClick = (e: any): void => {
    e.stopPropagation();
    setCurrentPart(e.object.material.name);
  };

  // Get list of interactive part node names for filtering
  const interactiveNodeNames = new Set(
    modelConfig.interactiveParts?.map(p => p.nodeName) ?? []
  );

  return (
    <group
      ref={ref}
      scale={modelConfig.scale ?? 1}
      position={modelConfig.position ?? [0, 0, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerMissed={handlePointerMissed}
      onClick={handleClick}
    >
      {/* Regular customizable parts */}
      {modelConfig.parts.map((part, index) => {
        const node = nodes[part.nodeName];
        const material = materials[part.materialName];
        
        // Skip if node or material doesn't exist
        if (!node?.geometry || !material) {
          console.warn(`Missing node or material for part: ${part.displayName}`);
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
          console.warn(`Missing interactive node or material for part: ${part.displayName}`);
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
useGLTF.preload(SHOE_CONFIG.modelPath);
