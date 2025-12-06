/**
 * Family Validation Utilities
 *
 * Validates model family configurations to ensure data integrity
 * and catch configuration errors early in development.
 */

import { hasModel } from '@/config/models.registry';
import type {
  FamilyValidationResult,
  FamilyVariant,
  ModelFamily,
} from '@/types/configurator';
import debug from '@/utils/debug';

/**
 * Validates a model family configuration
 *
 * Checks:
 * - All variant modelIds reference existing models in MODEL_REGISTRY
 * - Variant IDs are unique within the family
 * - Dimension constraints are valid (min < max)
 * - Warns about overlapping variant constraints
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
  family.variants.forEach((variant, _index) => {
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
    }

    // Validate dimension constraints
    if (!variant.constraints) {
      errors.push(`Variant '${variant.id}' missing constraints`);
      return;
    }

    const { width, height, depth } = variant.constraints;

    // Validate width constraints
    if (!width || width.length !== 2) {
      errors.push(`Variant '${variant.id}' has invalid width constraints`);
    } else if (width[0] >= width[1]) {
      errors.push(
        `Variant '${variant.id}' width min (${width[0]}) must be less than max (${width[1]})`,
      );
    }

    // Validate height constraints
    if (!height || height.length !== 2) {
      errors.push(`Variant '${variant.id}' has invalid height constraints`);
    } else if (height[0] >= height[1]) {
      errors.push(
        `Variant '${variant.id}' height min (${height[0]}) must be less than max (${height[1]})`,
      );
    }

    // Validate depth constraints
    if (!depth || depth.length !== 2) {
      errors.push(`Variant '${variant.id}' has invalid depth constraints`);
    } else if (depth[0] >= depth[1]) {
      errors.push(
        `Variant '${variant.id}' depth min (${depth[0]}) must be less than max (${depth[1]})`,
      );
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

  // Check for overlapping variant constraints (warning only)
  for (let i = 0; i < family.variants.length; i++) {
    for (let j = i + 1; j < family.variants.length; j++) {
      const variantA = family.variants[i];
      const variantB = family.variants[j];

      if (hasOverlappingConstraints(variantA, variantB)) {
        warnings.push(
          `Variants '${variantA.id}' and '${variantB.id}' have overlapping dimension constraints`,
        );
      }
    }
  }

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

/**
 * Checks if two variants have overlapping width/height constraints
 *
 * CRITICAL: Only checks width and height for overlap.
 * Depth is intentionally excluded as it never triggers variant switching.
 *
 * @param variantA - First variant
 * @param variantB - Second variant
 * @returns True if constraints overlap
 */
function hasOverlappingConstraints(
  variantA: FamilyVariant,
  variantB: FamilyVariant,
): boolean {
  // Check if width ranges overlap
  const widthOverlap = !(
    variantA.constraints.width[1] < variantB.constraints.width[0] ||
    variantB.constraints.width[1] < variantA.constraints.width[0]
  );

  // Check if height ranges overlap
  const heightOverlap = !(
    variantA.constraints.height[1] < variantB.constraints.height[0] ||
    variantB.constraints.height[1] < variantA.constraints.height[0]
  );

  // Overlap occurs if BOTH width AND height overlap
  return widthOverlap && heightOverlap;
}
