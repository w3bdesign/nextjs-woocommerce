import { Suspense, type ReactElement } from 'react';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

// Dynamically import 3D components to avoid SSR issues
const Canvas3D = dynamic(
  () => import('./Canvas3D.component'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }
);

const ModelViewer = dynamic(
  () => import('./ModelViewer.component'),
  { ssr: false }
);

const ColorPicker = dynamic(
  () => import('./ColorPicker.component'),
  { ssr: false }
);

interface ProductConfiguratorProps {
  modelPath?: string;
  className?: string;
}

/**
 * Main 3D Product Configurator component
 * Orchestrates Canvas, Model, and Color Picker
 */
export default function ProductConfigurator({ 
  modelPath,
  className = ''
}: ProductConfiguratorProps): ReactElement {
  return (
    <div className={`relative w-full ${className}`}>
      {/* 3D Canvas Container */}
      <div className="w-full h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
        <Suspense fallback={<LoadingSpinner />}>
          <Canvas3D>
            <ModelViewer modelPath={modelPath} />
          </Canvas3D>
        </Suspense>
      </div>

      {/* Color Picker Overlay */}
      <Suspense fallback={null}>
        <ColorPicker />
      </Suspense>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          <strong>Tip:</strong> Click on different parts of the model to customize colors
        </p>
      </div>
    </div>
  );
}
