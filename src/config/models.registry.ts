import type { ModelConfig } from '@/types/configurator';
import { CABINET_1_CONFIG } from './cabinet-1Model.config';
import { CABINET_CONFIG } from './cabinetModel.config';
import DRESSER_CONFIG from './dresserModel.config';

/**
 * Model Registry
 *
 * Central registry of all available 3D models for the configurator.
 * Add new model configurations here to make them available throughout the app.
 *
 * Usage:
 * - Reference models by their ID (e.g., 'cabinet-v1')
 * - Pass model ID to ProductConfigurator component
 * - Associate models with products via product.configurator.modelId
 */
export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  'cabinet-v1': CABINET_CONFIG,
  'cabinet-v2': CABINET_1_CONFIG,
  'dresser-v1': DRESSER_CONFIG,

  // Add more models here as they become available:
  // 'sofa-modern-v1': SOFA_CONFIG,
  // 'chair-office-v1': CHAIR_CONFIG,
  // etc.
};

/**
 * Default model ID to use when none is specified
 */
export const DEFAULT_MODEL_ID = 'cabinet-v1';

/**
 * Get a model configuration by ID
 * Returns undefined if model doesn't exist
 */
export function getModelConfig(modelId: string): ModelConfig | undefined {
  return MODEL_REGISTRY[modelId];
}

/**
 * Check if a model ID exists in the registry
 */
export function hasModel(modelId: string): boolean {
  return modelId in MODEL_REGISTRY;
}

/**
 * Get all available model IDs
 */
export function getAvailableModelIds(): string[] {
  return Object.keys(MODEL_REGISTRY);
}
