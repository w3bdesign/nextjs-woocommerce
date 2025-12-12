/**
 * Family Validation Utilities
 *
 * Validates model family configurations to ensure data integrity
 * and catch configuration errors early in development.
 */

import { getModelConfig, hasModel } from '@/config/models.registry';
import type { FamilyValidationResult, ModelFamily } from '@/types/configurator';
import debug from '@/utils/debug';

/**
 * Validates a model family configuration
 *
 * Checks:
 * - All variant modelIds reference existing models in MODEL_REGISTRY
 * - Variant IDs are unique within the family
 * - ModelConfig dimensions are valid (min < max)
 * - ScalableAxes configuration is valid
 *
 * @param family - The model family to validate
 * @returns Validation result with errors and warnings
 *
 * @example
 * const result = validateFamily(CABINET_FAMILY);
 * if (!result.valid) {
 *   console.error('Invalid family config:', result.errors);
 * }
 */
export function validateFamily(family: ModelFamily): FamilyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate family has at least one variant
  if (!family.variants || family.variants.length === 0) {
    errors.push(`Family '${family.familyId}' has no variants`);
    return { valid: false, errors, warnings };
  }

  // Track variant IDs for uniqueness check
  const variantIds = new Set<string>();

  // Validate each variant
  family.variants.forEach((variant) => {
    // Check variant ID uniqueness
    if (variantIds.has(variant.id)) {
      errors.push(
        `Duplicate variant ID '${variant.id}' in family '${family.familyId}'`,
      );
    }
    variantIds.add(variant.id);

    // Check modelId exists in MODEL_REGISTRY
    if (!hasModel(variant.modelId)) {
      errors.push(
        `Variant '${variant.id}' references non-existent model: '${variant.modelId}'`,
      );
      return; // Skip further checks if model doesn't exist
    }

    // Get the actual model config to validate dimensions
    const modelConfig = getModelConfig(variant.modelId);
    if (!modelConfig) {
      errors.push(
        `Variant '${variant.id}' model config not found: '${variant.modelId}'`,
      );
      return;
    }

    // Validate dimension constraints in ModelConfig
    if (modelConfig.dimensions) {
      const { width, height, length } = modelConfig.dimensions;

      // Validate width constraints
      if (width.min >= width.max) {
        errors.push(
          `Variant '${variant.id}' width min (${width.min}) must be less than max (${width.max})`,
        );
      }

      // Validate height constraints
      if (height.min >= height.max) {
        errors.push(
          `Variant '${variant.id}' height min (${height.min}) must be less than max (${height.max})`,
        );
      }

      // Validate depth/length constraints
      if (length.min >= length.max) {
        errors.push(
          `Variant '${variant.id}' length min (${length.min}) must be less than max (${length.max})`,
        );
      }
    }

    // Validate scalableAxes if present
    if (variant.scalableAxes) {
      const validAxes = ['x', 'y', 'z'];
      const invalidAxes = variant.scalableAxes.filter(
        (axis) => !validAxes.includes(axis),
      );
      if (invalidAxes.length > 0) {
        errors.push(
          `Variant '${variant.id}' has invalid scalableAxes: ${invalidAxes.join(', ')}`,
        );
      }
    }
  });

  // Log warnings in development
  if (warnings.length > 0) {
    warnings.forEach((warning) => debug.warn(`[Family Validation] ${warning}`));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
