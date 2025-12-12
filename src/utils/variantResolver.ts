import type { ModelConfig, ModelFamily } from '@/types/configurator';
import { debug } from './debug';

/**
 * Transfers user customizations from old variant to new variant during variant switching.
 * Preserves material colors and interactive states where possible.
 *
 * @param oldConfig - The ModelConfig of the previous variant
 * @param newConfig - The ModelConfig of the new variant
 * @param currentItems - Current material color assignments (Record<materialName, color>)
 * @param currentStates - Current interactive part states (Record<stateKey, boolean>)
 * @returns Object with newItems and newStates mapped to new variant structure
 *
 * @example
 * const { newItems, newStates } = transferCustomizations(
 *   oldModelConfig,
 *   newModelConfig,
 *   { 'm_cabinet': '#8B4513', 'm_door': '#654321' },
 *   { 'door_left': true }
 * );
 */
export function transferCustomizations(
  oldConfig: ModelConfig,
  newConfig: ModelConfig,
  currentItems: Record<string, string>,
  currentStates: Record<string, boolean>,
): { newItems: Record<string, string>; newStates: Record<string, boolean> } {
  const newItems: Record<string, string> = {};
  const newStates: Record<string, boolean> = {};

  // Map material colors from old variant to new variant
  Object.entries(currentItems).forEach(([oldMaterialName, color]) => {
    let matched = false;

    // Strategy 1: Try exact match first
    if (newConfig.parts.some((part) => part.materialName === oldMaterialName)) {
      newItems[oldMaterialName] = color;
      matched = true;
    }
    // Strategy 2: Try prefix match (e.g., 'm_cabinet' matches 'm_cabinet_body')
    else {
      const prefixMatch = newConfig.parts.find((part) =>
        part.materialName.startsWith(oldMaterialName),
      );

      if (prefixMatch) {
        newItems[prefixMatch.materialName] = color;
        matched = true;
      }
    }

    // Log warning for unmapped parts
    if (!matched && process.env.NODE_ENV === 'development') {
      debug.warn(
        `transferCustomizations: Could not map material '${oldMaterialName}' from old variant to new variant. Part will use default color.`,
      );
    }
  });

  // Map interactive states (preserve door positions, drawer states, etc.)
  if (oldConfig.interactiveParts && newConfig.interactiveParts) {
    Object.entries(currentStates).forEach(([stateKey, value]) => {
      // Check if new config has interactive part with matching stateKey
      const hasMatchingState = newConfig.interactiveParts!.some(
        (part) => part.stateKey === stateKey,
      );

      if (hasMatchingState) {
        newStates[stateKey] = value;
      } else if (process.env.NODE_ENV === 'development') {
        // Log warning for unmapped interactive states
        debug.warn(
          `transferCustomizations: Interactive state '${stateKey}' not found in new variant. State will be reset.`,
        );
      }
    });
  }

  return { newItems, newStates };
}

/**
 * Preloads all 3D models for a family's variants.
 *
 * Uses Promise.allSettled to handle partial failures gracefully.
 * Stores successfully loaded models in configuratorStore.preloadedModels.
 *
 * @param family - The ModelFamily to preload variants for
 * @returns Promise resolving to preload results with succeeded/failed/total counts
 * @throws Error if ALL variants fail to load
 *
 * Error Handling Strategy:
 * - Partial failures: Log errors, continue with successful variants
 * - Complete failure: Throw error to prevent broken configurator
 * - User notification recommended for partial failures (handled by caller)
 *
 * @example
 * try {
 *   const result = await preloadFamilyModels(CABINET_FAMILY);
 *   console.log(`Loaded ${result.succeeded} of ${result.total} variants`);
 * } catch (error) {
 *   // Handle complete failure - show error UI
 * }
 */
export async function preloadFamilyModels(family: ModelFamily): Promise<{
  succeeded: number;
  failed: Array<{ variantId: string; modelId: string; error: any }>;
  total: number;
}> {
  const { useGLTF } = await import('@react-three/drei');
  const { MODEL_REGISTRY } = await import('@/config/models.registry');

  // Dynamically import configuratorState to avoid circular dependency
  // Note: Currently unused but kept for future cache management
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { configuratorState } = await import('@/stores/configuratorStore');

  if (process.env.NODE_ENV === 'development') {
    debug.log(
      `[Preload] Starting preload for family: ${family.familyId} (${family.variants.length} variants)`,
    );
  }

  // Use drei's useGLTF.preload which properly handles texture references
  // This prevents "Illegal invocation" errors when cloning scenes
  const loadPromises = family.variants.map(async (variant) => {
    const modelConfig = MODEL_REGISTRY[variant.modelId];

    if (!modelConfig) {
      throw new Error(
        `Model not found in registry: ${variant.modelId} (variant: ${variant.id})`,
      );
    }

    try {
      // drei's preload returns a promise that resolves when model is cached
      await useGLTF.preload(modelConfig.modelPath);

      // Return success marker - actual GLTF will be loaded via useGLTF hook in component
      return {
        variantId: variant.id,
        modelPath: modelConfig.modelPath,
        success: true,
      };
    } catch (error) {
      throw {
        variantId: variant.id,
        modelId: variant.modelId,
        modelPath: modelConfig.modelPath,
        error,
      };
    }
  });

  // Wait for all loads to complete (success or failure)
  const results = await Promise.allSettled(loadPromises);

  // Process results
  const succeeded: Array<{
    variantId: string;
    modelPath: string;
    success: boolean;
  }> = [];
  const failed: Array<{
    variantId: string;
    modelId: string;
    modelPath: string;
    error: any;
  }> = [];

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      succeeded.push(result.value);
    } else {
      failed.push(result.reason);
    }
  });

  // Log successfully preloaded variants
  // Note: Models are cached by drei's useGLTF, no need to store in configuratorState
  if (process.env.NODE_ENV === 'development') {
    succeeded.forEach(({ variantId }) => {
      debug.log(`[Preload] Successfully preloaded variant: ${variantId}`);
    });
  }

  // Log errors for failed variants
  if (failed.length > 0) {
    failed.forEach(({ variantId, modelId, modelPath, error }) => {
      debug.error(
        `[Preload] Failed to load variant '${variantId}' (model: ${modelId}, path: ${modelPath}):`,
        error,
      );
    });
  }

  // If ALL variants failed, throw error
  if (succeeded.length === 0) {
    const errorMessage = `Failed to preload any variants for family: ${family.familyId}`;
    debug.error(`[Preload] ${errorMessage}`);
    throw new Error(errorMessage);
  }

  // If some failed, log warning
  if (failed.length > 0 && succeeded.length > 0) {
    debug.warn(
      `[Preload] Partially loaded family '${family.familyId}': ${succeeded.length}/${family.variants.length} variants available. Failed variants: ${failed.map((f) => f.variantId).join(', ')}`,
    );
  }

  if (process.env.NODE_ENV === 'development') {
    debug.log(
      `[Preload] Completed preload for family '${family.familyId}': ${succeeded.length}/${family.variants.length} variants loaded`,
    );
  }

  return {
    succeeded: succeeded.length,
    failed: failed.map(({ variantId, modelId, error }) => ({
      variantId,
      modelId,
      error,
    })),
    total: family.variants.length,
  };
}
