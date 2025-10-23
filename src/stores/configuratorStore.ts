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
  /** Dimensions in cm [width, height, depth] */
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  /** Last computed model bounding box (world-aligned) */
  modelBoundingBox: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  } | null;
}

export const configuratorState = proxy<ConfiguratorState>({
  current: null,
  items: {},
  interactiveStates: {},
  dimensions: {
    width: 0,
    height: 0,
    depth: 0,
  },
  modelBoundingBox: null,
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
      width: modelConfig.dimensions.width.default,
      height: modelConfig.dimensions.height.default,
      depth: modelConfig.dimensions.depth.default,
    };
  } else {
    // Fallback for models without dimension constraints
    configuratorState.dimensions = {
      width: 100,
      height: 100,
      depth: 100,
    };
  }
};

// Initialize with cabinet config on module load (default behavior)
initializeConfigurator(CABINET_CONFIG);

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
  axis: 'width' | 'height' | 'depth',
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
      width: modelConfig.dimensions.width.default,
      height: modelConfig.dimensions.height.default,
      depth: modelConfig.dimensions.depth.default,
    };
  }
};

/**
 * Publish model bounding box (world-aligned) so other UI components can
 * consume it (e.g., silhouette placement). ModelViewer should call this
 * after computing the final grounded bounding box.
 */
export const setModelBoundingBox = (
  min: { x: number; y: number; z: number },
  max: { x: number; y: number; z: number },
): void => {
  configuratorState.modelBoundingBox = { min, max };
};
