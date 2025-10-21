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
}

export const configuratorState = proxy<ConfiguratorState>({
  current: null,
  items: {},
});

/**
 * Initialize configurator with a model configuration
 * Populates the items state with default colors from the model config
 */
export const initializeConfigurator = (modelConfig: ModelConfig): void => {
  const items: Record<string, string> = {};
  
  modelConfig.parts.forEach(part => {
    items[part.materialName] = part.defaultColor;
  });
  
  configuratorState.current = null;
  configuratorState.items = items;
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
 * Update the color of a specific part
 */
export const updatePartColor = (part: string, color: string): void => {
  if (configuratorState.items[part] !== undefined) {
    configuratorState.items[part] = color;
  }
};
