import { proxy } from 'valtio';
import type { ModelConfig } from '@/types/configurator';
import { SHOE_CONFIG } from '@/config/shoeModel.config';

/**
 * Configurator state management using Valtio proxy
 * This manages the 3D model customization state
 */
interface ConfiguratorState {
  current: string | null;
  items: Record<string, string>;
  /** Interactive parts state (true = active/open, false = inactive/closed) */
  interactiveStates: Record<string, boolean>;
}

export const configuratorState = proxy<ConfiguratorState>({
  current: null,
  items: {},
  interactiveStates: {},
});

/**
 * Initialize configurator with a model configuration
 * Populates the items state with default colors from the model config
 * and interactive states with their default values
 */
export const initializeConfigurator = (modelConfig: ModelConfig): void => {
  const items: Record<string, string> = {};
  const interactiveStates: Record<string, boolean> = {};
  
  modelConfig.parts.forEach(part => {
    items[part.materialName] = part.defaultColor;
  });
  
  // Initialize interactive parts states
  if (modelConfig.interactiveParts) {
    modelConfig.interactiveParts.forEach(part => {
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
};

// Initialize with shoe config on module load (default behavior)
initializeConfigurator(SHOE_CONFIG);

/**
 * Reset configurator to default state
 * Uses the shoe config as the default for backwards compatibility
 */
export const resetConfigurator = (): void => {
  initializeConfigurator(SHOE_CONFIG);
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
  configuratorState.interactiveStates[nodeName] = !configuratorState.interactiveStates[nodeName];
};

/**
 * Set an interactive part state explicitly
 */
export const setInteractivePartState = (nodeName: string, state: boolean): void => {
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
