import { Suspense, useEffect, type ReactElement } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Info } from 'lucide-react';
import { initializeConfigurator } from '@/stores/configuratorStore';
import { getModelConfig, DEFAULT_MODEL_ID } from '@/config/models.registry';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Dynamically import 3D components to avoid SSR issues
const Canvas3D = dynamic(() => import('./Canvas3D.component'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
});

const ModelViewer = dynamic(() => import('./ModelViewer.component'), {
  ssr: false,
});

const ColorPicker = dynamic(() => import('./ColorPicker.component'), {
  ssr: false,
});

const InteractiveControls = dynamic(
  () => import('./InteractiveControls.component'),
  { ssr: false },
);

const DimensionControls = dynamic(
  () => import('./DimensionControls.component'),
  { ssr: false },
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
  className = '',
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
    <div className={`w-full ${className}`}>
      {/* Main Configurator Container - Flex Layout */}
      <div className="flex flex-col lg:flex-row rounded-lg shadow-lg overflow-hidden bg-white relative">
        {/* 3D Canvas Container */}
        <div className="flex-1 h-[400px] md:h-[500px] lg:h-[600px] bg-white relative">
          {/* Info Icon Tooltip - Top Right Corner */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Customization Guide"
                >
                  <Info className="w-4 h-4 text-blue-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Customization Guide</p>
                  <ul className="text-xs space-y-1.5">
                    <li>
                      🎨 Click on the model to select parts and change colors
                    </li>
                    {modelConfig.interactiveParts &&
                      modelConfig.interactiveParts.length > 0 && (
                        <li>
                          🚪 Use the controls to open/close doors and toggle
                          parts
                        </li>
                      )}
                    <li>🖱️ Drag to rotate and scroll to zoom the 3D view</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <Canvas3D shadowConfig={modelConfig.shadow}>
              <ModelViewer modelConfig={modelConfig} />
            </Canvas3D>
          </Suspense>
        </div>

        {/* Controls Sidebar */}
        <aside
          className="w-full lg:w-80 bg-gradient-to-b from-gray-50 to-white border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto"
          style={{ maxHeight: '600px' }}
          aria-label="Configurator Controls"
        >
          <Suspense fallback={null}>
            <ColorPicker />
          </Suspense>

          <Suspense fallback={null}>
            <DimensionControls modelId={modelId} />
          </Suspense>

          <Suspense fallback={null}>
            <InteractiveControls
              interactiveParts={modelConfig.interactiveParts}
            />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
