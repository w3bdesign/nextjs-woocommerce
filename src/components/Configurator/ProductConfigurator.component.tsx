import { Suspense, useEffect, type ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { initializeConfigurator } from '@/stores/configuratorStore';
import { getModelConfig, DEFAULT_MODEL_ID } from '@/config/models.registry';

// Dynamically import 3D components to avoid SSR issues
const Canvas3D = dynamic(
  () => import('./Canvas3D.component'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

const InteractiveControls = dynamic(
  () => import('./InteractiveControls.component'),
  { ssr: false }
);

interface ProductConfiguratorProps {
  modelId?: string;
  className?: string;
}

/**
 * Main 3D Product Configurator component
 * Orchestrates Canvas, Model, and Color Picker
 */
export default function ProductConfigurator({ 
  modelId = DEFAULT_MODEL_ID,
  className = ''
}: ProductConfiguratorProps): ReactElement {
  // Get the model configuration from the registry
  const modelConfig = getModelConfig(modelId);
  
  // Initialize the configurator store with the model config
  useEffect(() => {
    if (modelConfig) {
      initializeConfigurator(modelConfig);
    } else {
      console.warn(`Model ID "${modelId}" not found in registry`);
    }
  }, [modelId, modelConfig]);
  
  // Don't render if model config doesn't exist
  if (!modelConfig) {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="w-full h-[600px] bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
          <p className="text-gray-600">Model configuration not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`relative w-full ${className}`}>
      {/* 3D Canvas Container */}
      <div className="w-full h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
        <Suspense fallback={
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <Canvas3D shadowConfig={modelConfig.shadow}>
            <ModelViewer modelConfig={modelConfig} />
          </Canvas3D>
        </Suspense>
      </div>

      {/* Color Picker Overlay */}
      <Suspense fallback={null}>
        <ColorPicker />
      </Suspense>

      {/* Interactive Controls - Fixed position top right */}
      <Suspense fallback={null}>
        <InteractiveControls interactiveParts={modelConfig.interactiveParts} />
      </Suspense>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <svg 
            className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
              clipRule="evenodd" 
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-gray-700 mb-2">
              <strong className="text-blue-600">Customization Guide:</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>🎨 <strong>Click on the model</strong> to select parts and change colors (left panel)</li>
              {modelConfig.interactiveParts && modelConfig.interactiveParts.length > 0 && (
                <li>🚪 <strong>Use controls on the right</strong> to open/close doors and toggle parts</li>
              )}
              <li>🖱️ <strong>Drag to rotate</strong> and scroll to zoom the 3D view</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
