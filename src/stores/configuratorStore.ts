import { CABINET_CONFIG } from '@/config/cabinetModel.config';
import type { ModelConfig } from '@/types/configurator';
import { proxy } from 'valtio';

/**
 * Configurator state management using Valtio proxy
 * This manages the 3D model customization state
 */
interface ConfiguratorState {
  current: string | null;
  items: Record<string, string>;
  /** Interactive parts state (true = active/open, false = inactive/closed) */
  interactiveStates: Record<string, boolean>;
  /** Dimensions in cm [length, width, height] - WooCommerce standard */
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  /** Last computed model bounding box (world-aligned) */
  // NOTE: model bounding boxes are now published to the scene mediator
  // (src/stores/sceneMediatorStore.ts). Configurator store keeps only
  // configuration-related state (colors, interactive states, dimensions).
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
});

/**
 * Initialize configurator with a model configuration
 * Populates the items state with default colors from the model config
 * and interactive states with their default values
 */
export const initializeConfigurator = (modelConfig: ModelConfig): void => {
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
 */
export const setDimension = (
  axis: 'length' | 'width' | 'height',
  value: number,
): void => {
  configuratorState.dimensions[axis] = value;
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
