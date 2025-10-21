import { proxy } from 'valtio';

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
  items: {
    laces: '#ffffff',
    mesh: '#ffffff',
    caps: '#ffffff',
    inner: '#ffffff',
    sole: '#ffffff',
    stripes: '#ffffff',
    band: '#ffffff',
    patch: '#ffffff',
  },
});

/**
 * Reset configurator to default state
 */
export const resetConfigurator = (): void => {
  configuratorState.current = null;
  configuratorState.items = {
    laces: '#ffffff',
    mesh: '#ffffff',
    caps: '#ffffff',
    inner: '#ffffff',
    sole: '#ffffff',
    stripes: '#ffffff',
    band: '#ffffff',
    patch: '#ffffff',
  };
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
