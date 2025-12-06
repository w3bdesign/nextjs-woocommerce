import { CABINET_CONFIG } from '@/config/cabinetModel.config';
import { getModelFamily } from '@/config/families.registry';
import { MODEL_REGISTRY } from '@/config/models.registry';
import type { ModelConfig } from '@/types/configurator';
import { debug } from '@/utils/debug';
import {
  resolveVariantForDimensions,
  transferCustomizations,
} from '@/utils/variantResolver';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { proxy } from 'valtio';

/**
 * Configurator state management using Valtio proxy
 * This manages the 3D model customization state including:
 * - Selected materials and colors for each part
 * - Interactive part states (doors open/closed, etc.)
 * - Dimensions (width, height, depth)
 * - Family/variant system for dimension-driven model switching
 *
 * NOTE: model bounding boxes are now published to the scene mediator
 * (src/stores/sceneMediatorStore.ts). Configurator store keeps only
 * configuration-related state (colors, interactive states, dimensions).
 */
interface ConfiguratorState {
  current: string | null;
  items: Record<string, string>;
  /** Interactive parts state (true = active/open, false = inactive/closed) */
  interactiveStates: Record<string, boolean>;
  /** Dimensions in cm [length, width, height] - WooCommerce standard */
  dimensions: {
    length: number; // depth (Z-axis)
    width: number; // X-axis
    height: number; // Y-axis
  };
  /** Product database ID for cart operations */
  productId: number | null;
  /** Model ID from the registry (backward compatibility - derived from activeVariantId) */
  modelId: string | null;

  // Family-based variant system
  /** Product family this configuration belongs to */
  familyId: string | null;
  /** Current variant ID (e.g., 'cabinet-small') */
  activeVariantId: string;
  /** Cache of preloaded 3D models keyed by variantId (Record used instead of Map for Valtio compatibility) */
  preloadedModels: Record<string, GLTF>;
  /** Prevents concurrent variant resolution */
  isResolvingVariant: boolean;
  /** Request tracking for race condition prevention */
  variantResolutionId: number;
}

export const configuratorState = proxy<ConfiguratorState>({
  current: null,
  items: {},
  interactiveStates: {},
  dimensions: {
    length: 0,
    width: 0,
    height: 0,
  },
  productId: null,
  modelId: null,
  // Family-based variant system initial values
  familyId: null,
  activeVariantId: '',
  preloadedModels: {},
  isResolvingVariant: false,
  variantResolutionId: 0,
});

/**
 * Initialize configurator with a model configuration
 * Populates the items state with default colors from the model config
 * and interactive states with their default values
 */
export const initializeConfigurator = (
  modelConfig: ModelConfig,
  productId?: number,
  modelId?: string,
): void => {
  const items: Record<string, string> = {};
  const interactiveStates: Record<string, boolean> = {};

  modelConfig.parts.forEach((part) => {
    items[part.materialName] = part.defaultColor;
  });

  // Initialize interactive parts states
  if (modelConfig.interactiveParts) {
    modelConfig.interactiveParts.forEach((part) => {
      const stateKey = part.stateKey || part.nodeName;
      // Only set if not already set (avoid overwriting with later parts)
      if (!(stateKey in interactiveStates)) {
        interactiveStates[stateKey] = part.defaultState;
      }
    });
  }

  configuratorState.current = null;
  configuratorState.items = items;
  configuratorState.interactiveStates = interactiveStates;
  configuratorState.productId = productId ?? null;
  configuratorState.modelId = modelId ?? null;

  // Initialize dimensions from config or defaults
  if (modelConfig.dimensions) {
    configuratorState.dimensions = {
      length: modelConfig.dimensions.length.default,
      width: modelConfig.dimensions.width.default,
      height: modelConfig.dimensions.height.default,
    };
  } else {
    // Fallback for models without dimension constraints
    configuratorState.dimensions = {
      length: 100,
      width: 100,
      height: 100,
    };
  }
};

/**
 * Reset configurator to default state
 * Uses the cabinet config as the default
 */
export const resetConfigurator = (): void => {
  initializeConfigurator(CABINET_CONFIG);
};

/**
 * Set the currently selected part
 */
export const setCurrentPart = (part: string | null): void => {
  configuratorState.current = part;
};

/**
 * Toggle an interactive part state (e.g., open/close door)
 */
export const toggleInteractivePart = (nodeName: string): void => {
  configuratorState.interactiveStates[nodeName] =
    !configuratorState.interactiveStates[nodeName];
};

/**
 * Set an interactive part state explicitly
 */
export const setInteractivePartState = (
  nodeName: string,
  state: boolean,
): void => {
  configuratorState.interactiveStates[nodeName] = state;
};

/**
 * Update the color of a specific part
 */
export const updatePartColor = (part: string, color: string): void => {
  if (configuratorState.items[part] !== undefined) {
    configuratorState.items[part] = color;
  }
};

/**
 * Update the color of ALL parts (global color application)
 * This is used when the user selects a color from the global color picker
 */
export const updateAllPartColors = (color: string): void => {
  Object.keys(configuratorState.items).forEach((partKey) => {
    configuratorState.items[partKey] = color;
  });
};

/**
 * Set dimension value (in cm)
 * @deprecated Use setDimensions instead for proper variant resolution
 */
export const setDimension = (
  axis: 'length' | 'width' | 'height',
  value: number,
): void => {
  configuratorState.dimensions[axis] = value;
};

// Debounce timer for variant resolution
let variantResolutionTimer: number | null = null;
const VARIANT_RESOLUTION_DEBOUNCE_MS = 150;

/**
 * Set dimensions with depth isolation and debounced variant resolution
 *
 * CRITICAL: Depth changes NEVER trigger variant switching.
 * Only width and height changes can trigger variant resolution.
 *
 * @param dimensions - New dimensions in cm { width, height, depth }
 */
export const setDimensions = (dimensions: {
  width: number;
  height: number;
  depth: number;
}): void => {
  // Update depth immediately (no variant check per requirement)
  configuratorState.dimensions.length = dimensions.depth;
  configuratorState.dimensions.width = dimensions.width;
  configuratorState.dimensions.height = dimensions.height;

  // Increment request ID for race condition tracking
  configuratorState.variantResolutionId += 1;
  const requestId = configuratorState.variantResolutionId;

  // Clear existing debounce timer
  if (variantResolutionTimer !== null) {
    clearTimeout(variantResolutionTimer);
    variantResolutionTimer = null;
  }

  // Skip variant resolution if no family assigned
  if (!configuratorState.familyId) {
    return;
  }

  // Debounced variant resolution (only width/height, NEVER depth)
  variantResolutionTimer = window.setTimeout(() => {
    variantResolutionTimer = null;
    resolveAndSwitch(
      dimensions.width,
      dimensions.height,
      configuratorState.familyId!,
      requestId,
    );
  }, VARIANT_RESOLUTION_DEBOUNCE_MS);
};

/**
 * Async variant resolution with race condition guards
 *
 * @param width - Width dimension in cm
 * @param height - Height dimension in cm
 * @param familyId - Family ID for variant lookup
 * @param requestId - Request tracking ID for race condition prevention
 */
async function resolveAndSwitch(
  width: number,
  height: number,
  familyId: string,
  requestId: number,
): Promise<void> {
  try {
    // Guard: Check if this request is stale (newer request has started)
    if (requestId !== configuratorState.variantResolutionId) {
      if (process.env.NODE_ENV === 'development') {
        debug.log(
          `[Variant Resolution] Request ${requestId} aborted (stale). Current: ${configuratorState.variantResolutionId}`,
        );
      }
      return;
    }

    // Prevent concurrent variant resolution
    if (configuratorState.isResolvingVariant) {
      if (process.env.NODE_ENV === 'development') {
        debug.log(
          `[Variant Resolution] Request ${requestId} blocked (resolution in progress)`,
        );
      }
      return;
    }

    // Set resolution flag
    configuratorState.isResolvingVariant = true;

    // Get family configuration
    const family = getModelFamily(familyId);
    if (!family) {
      debug.error(`[Variant Resolution] Family not found: ${familyId}`);
      configuratorState.isResolvingVariant = false;
      return;
    }

    // Resolve variant based on width/height ONLY (depth never triggers)
    const newVariant = resolveVariantForDimensions({ width, height }, family);

    // Guard: Check again if request is still valid after async operation
    if (requestId !== configuratorState.variantResolutionId) {
      if (process.env.NODE_ENV === 'development') {
        debug.log(
          `[Variant Resolution] Request ${requestId} aborted after resolution (newer request started)`,
        );
      }
      configuratorState.isResolvingVariant = false;
      return;
    }

    // If variant resolved and differs from current, switch
    if (newVariant && newVariant.id !== configuratorState.activeVariantId) {
      if (process.env.NODE_ENV === 'development') {
        debug.log(
          `[Variant Resolution] Switching from ${configuratorState.activeVariantId} to ${newVariant.id}`,
        );
      }
      // switchVariant will be implemented in next todo
      // switchVariant(newVariant.id);
    } else if (!newVariant) {
      if (process.env.NODE_ENV === 'development') {
        debug.warn(
          `[Variant Resolution] No matching variant for dimensions: width=${width}cm, height=${height}cm`,
        );
      }
    }

    configuratorState.isResolvingVariant = false;
  } catch (error) {
    configuratorState.isResolvingVariant = false;
    debug.error('[Variant Resolution] Error during variant resolution:', error);
  }
}

/**
 * Switches to a new variant, transferring user customizations from the current variant.
 * Updates activeVariantId, items, interactiveStates, and modelId (for backward compatibility).
 *
 * @param newVariantId - The ID of the variant to switch to
 *
 * Prerequisites:
 * - New variant's model must be preloaded in configuratorState.preloadedModels
 * - familyId must be set in configuratorState
 * - ModelViewer will read from preloadedModels cache to render the new model
 */
export const switchVariant = (newVariantId: string): void => {
  const { familyId, activeVariantId, items, interactiveStates } =
    configuratorState;

  // Validate family is set
  if (!familyId) {
    debug.error('[Variant Switch] Cannot switch variant: familyId not set');
    return;
  }

  // Get family configuration
  const family = getModelFamily(familyId);
  if (!family) {
    debug.error(`[Variant Switch] Family not found: ${familyId}`);
    return;
  }

  // Get old and new variant configs
  const oldVariant = family.variants.find((v) => v.id === activeVariantId);
  const newVariant = family.variants.find((v) => v.id === newVariantId);

  if (!newVariant) {
    debug.error(
      `[Variant Switch] New variant not found in family: ${newVariantId}`,
    );
    return;
  }

  // Get ModelConfigs from registry
  const oldModelConfig = oldVariant ? MODEL_REGISTRY[oldVariant.modelId] : null;
  const newModelConfig = MODEL_REGISTRY[newVariant.modelId];

  if (!newModelConfig) {
    debug.error(
      `[Variant Switch] Model not found in registry: ${newVariant.modelId}`,
    );
    return;
  }

  // Transfer customizations from old to new variant
  const { newItems, newStates } = oldModelConfig
    ? transferCustomizations(
        oldModelConfig,
        newModelConfig,
        items,
        interactiveStates,
      )
    : { newItems: {}, newStates: {} };

  // If no old config (first initialization), use defaults from new config
  if (!oldModelConfig) {
    newModelConfig.parts.forEach((part) => {
      newItems[part.materialName] = part.defaultColor;
    });

    if (newModelConfig.interactiveParts) {
      newModelConfig.interactiveParts.forEach((part) => {
        const stateKey = part.stateKey || part.nodeName;
        newStates[stateKey] = part.defaultState ?? false;
      });
    }
  }

  // Update store state with new variant configuration
  configuratorState.activeVariantId = newVariantId;
  configuratorState.items = newItems;
  configuratorState.interactiveStates = newStates;

  // Update modelId for backward compatibility
  configuratorState.modelId = newVariant.modelId;

  // Development-mode logging
  if (process.env.NODE_ENV === 'development') {
    debug.log(
      `[Variant Switch] Switched from variant '${activeVariantId}' to '${newVariantId}' (model: ${newVariant.modelId})`,
    );
    debug.log('[Variant Switch] Transferred items:', newItems);
    debug.log('[Variant Switch] Transferred states:', newStates);
  }
};

/**
 * Reset dimensions to defaults from model config
 */
export const resetDimensions = (modelConfig: ModelConfig): void => {
  if (modelConfig.dimensions) {
    configuratorState.dimensions = {
      length: modelConfig.dimensions.length.default,
      width: modelConfig.dimensions.width.default,
      height: modelConfig.dimensions.height.default,
    };
  }
};

/**
 * Publish model bounding box (world-aligned) so other UI components can
 * consume it (e.g., silhouette placement). ModelViewer should call this
 * after computing the final grounded bounding box.
 */
// Note: model bounding boxes are now published to the scene mediator
// (src/stores/sceneMediatorStore.ts). Any code that previously called
// `setModelBoundingBox` should be updated to call `setModelWorld` on the
// mediator. The legacy API has been removed to avoid accidental
// environment-facing writes from the configurator store.
