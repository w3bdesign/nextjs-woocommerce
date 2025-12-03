import { DEFAULT_MODEL_ID, getModelConfig } from '@/config/models.registry';
import {
  initializeConfigurator,
  toggleInteractivePart,
} from '@/stores/configuratorStore';
import debug from '@/utils/debug';
import { DoorOpen, Heart, Info, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, type ReactElement } from 'react';
import { FloatingButton } from './FloatingButton.component';
import { findDoorPart, getPartStateKey } from './utils/doorHelpers';

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

const ConfiguratorTabs = dynamic(() => import('./ConfiguratorTabs.component'), {
  ssr: false,
});

const ProductInfo = dynamic(() => import('./ProductInfo.component'), {
  ssr: false,
});

const Canvas3DErrorBoundary = dynamic(
  () => import('./Canvas3DErrorBoundary.component'),
  { ssr: false },
);

interface ProductConfiguratorProps {
  modelId?: string;
  className?: string;
  productId?: number;
  product?: {
    price?: string;
    regularPrice?: string;
    salePrice?: string;
    onSale?: boolean;
  };
}

/**
 * Main 3D Product Configurator component
 * Orchestrates Canvas, Model, and Color Picker
 */
export default function ProductConfigurator({
  modelId = DEFAULT_MODEL_ID,
  className = '',
  productId,
  product,
}: ProductConfiguratorProps): ReactElement {
  // Get the model configuration from the registry
  const modelConfig = getModelConfig(modelId);

  // Initialize the configurator store with the model config
  useEffect(() => {
    if (modelConfig) {
      initializeConfigurator(modelConfig, productId, modelId);
    } else {
      debug.warn(`Model ID "${modelId}" not found in registry`);
    }
  }, [modelId, modelConfig, productId]);

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
      {/* Main Configurator Container - Enhanced Layout */}
      <div className="flex flex-col xl:flex-row rounded-xl shadow-2xl overflow-hidden bg-white relative">
        {/* 3D Canvas Container - Left Side */}
        <div className="flex-1 h-[400px] sm:h-[500px] xl:h-[700px] bg-gradient-to-br from-gray-50 to-white relative">
          {/* Info Icon Tooltip - Top Right Corner */}
          <FloatingButton
            icon={<Info className="w-5 h-5 text-blue-600" />}
            position="top-right"
            ariaLabel="Customization Guide"
            tooltipText={
              modelConfig.interactiveParts &&
              modelConfig.interactiveParts.length > 0
                ? '🎨 Colors are applied globally to all parts\n🚪 Use the controls to open/close doors\n🖱️ Drag to rotate and scroll to zoom'
                : '🎨 Select colors from the sidebar to customize\n🖱️ Drag to rotate and scroll to zoom'
            }
          />

          {/* Save Configuration - Floating Button Bottom Right */}
          <FloatingButton
            icon={<Heart className="w-5 h-5 text-red-500" />}
            position="bottom-right"
            ariaLabel="Save Configuration"
            tooltipText="Save Configuration"
          />

          {/* Door Toggle Buttons - Left and Right Doors */}
          {modelConfig.interactiveParts &&
            modelConfig.interactiveParts.length > 0 && (
              <>
                {/* Left Door Toggle */}
                <FloatingButton
                  icon={
                    <DoorOpen className="w-5 h-5 text-gray-600 scale-x-[-1]" />
                  }
                  position="bottom-left"
                  ariaLabel="Toggle Left Door"
                  tooltipText="Open/Close Left Door"
                  tooltipSide="right"
                  onClick={() => {
                    const leftDoor = findDoorPart(
                      'left',
                      modelConfig.interactiveParts,
                    );
                    if (leftDoor) {
                      toggleInteractivePart(getPartStateKey(leftDoor));
                    }
                  }}
                />

                {/* Right Door Toggle */}
                <FloatingButton
                  icon={<DoorOpen className="w-5 h-5 text-gray-600" />}
                  position="bottom-left-2"
                  ariaLabel="Toggle Right Door"
                  tooltipText="Open/Close Right Door"
                  tooltipSide="right"
                  onClick={() => {
                    const rightDoor = findDoorPart(
                      'right',
                      modelConfig.interactiveParts,
                    );
                    if (rightDoor) {
                      toggleInteractivePart(getPartStateKey(rightDoor));
                    }
                  }}
                />
              </>
            )}

          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <Canvas3DErrorBoundary>
              <Canvas3D cameraConfig={modelConfig.camera}>
                <ModelViewer modelConfig={modelConfig} />
              </Canvas3D>
            </Canvas3DErrorBoundary>
          </Suspense>
        </div>

        {/* Tabbed Controls Panel - Right Side */}
        <Suspense fallback={null}>
          <ConfiguratorTabs modelConfig={modelConfig} product={product} />
        </Suspense>
      </div>

      {/* Product Information Section */}
      <Suspense fallback={null}>
        <ProductInfo />
      </Suspense>
    </div>
  );
}
