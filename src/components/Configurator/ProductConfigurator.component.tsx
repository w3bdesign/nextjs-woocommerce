import { getModelFamily } from '@/config/families.registry';
import { getModelConfig } from '@/config/models.registry';
import { useToast } from '@/hooks/use-toast';
import {
  configuratorState,
  initializeConfigurator,
  toggleInteractivePart,
} from '@/stores/configuratorStore';
import debug from '@/utils/debug';
import { preloadFamilyModels } from '@/utils/variantResolver';
import { DoorOpen, Heart, Info, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState, type ReactElement } from 'react';
import { useSnapshot } from 'valtio';
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
  familyId?: string; // Family-based configuration (preferred)
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
 *
 * Supports both family-based (preferred) and legacy single-model configuration
 */
export default function ProductConfigurator({
  familyId,
  className = '',
  productId,
  product,
}: ProductConfiguratorProps): ReactElement {
  // Loading state for family preloading
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get reactive snapshot from configurator store
  const snap = useSnapshot(configuratorState);

  // Determine configuration mode: family-based or legacy single-model
  const family = familyId ? getModelFamily(familyId) : undefined;

  // For family-based: Get the active variant's modelId from store
  const activeModelId =
    family && snap.activeVariantId
      ? family.variants.find((v) => v.id === snap.activeVariantId)?.modelId ||
        family.variants[0]?.modelId
      : undefined;

  // Get the model configuration from the registry (reactive to activeVariantId changes)
  // Guard the call since `activeModelId` may be undefined during initialization
  const modelConfig = activeModelId ? getModelConfig(activeModelId) : undefined;

  // Initialize configurator with preloading for family-based products
  useEffect(() => {
    if (family) {
      // If there's an activeVariantId but its model config is missing, warn
      if (snap.activeVariantId && !modelConfig) {
        debug.warn(
          `Model ID "${activeModelId}" not found in registry. ` +
            `FamilyId: ${familyId || 'none'}`,
        );
      }

      // Family-based initialization with preloading
      const initializeFamilyConfigurator = async () => {
        // Skip if family is already initialized (prevents re-initialization during variant switches)
        if (snap.familyId === familyId && snap.activeVariantId) {
          debug.log(
            `[ProductConfigurator] Family already initialized, skipping: ${familyId}`,
          );
          return;
        }

        setIsPreloading(true);
        setPreloadError(null);

        try {
          debug.log(`[ProductConfigurator] Preloading family: ${familyId}`);

          // Preload all variants
          const result = await preloadFamilyModels(family);

          debug.log(
            `[ProductConfigurator] Preloaded ${result.succeeded}/${result.total} variants`,
          );

          // Show warning notification if some variants failed to load
          if (result.failed.length > 0) {
            const failedNames = result.failed
              .map((f) => f.variantId)
              .join(', ');
            toast({
              variant: 'destructive',
              title: 'Some size options unavailable',
              description: `Failed to load ${result.failed.length} variant(s): ${failedNames}. You can still use other available sizes.`,
            });
            debug.warn(
              `[ProductConfigurator] Partial load: ${result.failed.length} variants failed`,
            );
          }

          // Determine initial variant
          const defaultVariantId =
            family.metadata?.defaultVariantId || family.variants[0]?.id;
          const defaultVariant =
            family.variants.find((v) => v.id === defaultVariantId) ||
            family.variants[0];

          if (!defaultVariant) {
            throw new Error(`No variants found in family: ${familyId}`);
          }

          // Validate familyId is defined
          if (!familyId) {
            throw new Error(
              'Family ID is required for family-based configuration',
            );
          }

          // Set family and variant in store
          configuratorState.familyId = familyId;
          configuratorState.activeVariantId = defaultVariant.id;

          // Get the model config for the default variant
          const defaultModelConfig = getModelConfig(defaultVariant.modelId);

          if (!defaultModelConfig) {
            throw new Error(
              `Model config not found for variant: ${defaultVariant.modelId}`,
            );
          }

          // Initialize configurator with default variant's model
          initializeConfigurator(defaultModelConfig, productId);

          debug.log(
            `[ProductConfigurator] Initialized with variant: ${defaultVariant.id} (${defaultVariant.displayName})`,
          );

          setIsPreloading(false);
        } catch (error) {
          debug.error(
            '[ProductConfigurator] Failed to initialize family configurator:',
            error,
          );
          setPreloadError(
            error instanceof Error ? error.message : 'Failed to load 3D models',
          );
          setIsPreloading(false);
        }
      };

      initializeFamilyConfigurator();
    } else {
      // If no family provided, show clear error UI (we removed legacy `modelId` support)
      throw new Error(
        'Legacy single-model `modelId` support removed. Use `familyId` on products to enable the configurator.',
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId, family, activeModelId, modelConfig, productId]);

  // Show loading skeleton while preloading family models
  if (isPreloading) {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="w-full h-[600px] bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-lg flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-800">
              Loading 3D models...
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Preparing {family?.variants.length || 0} variants for
              customization
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if preloading failed
  if (preloadError) {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="w-full h-[600px] bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-gray-800 font-semibold mb-2">
              Failed to Load 3D Models
            </p>
            <p className="text-gray-600 text-sm">{preloadError}</p>
          </div>
        </div>
      </div>
    );
  }

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
