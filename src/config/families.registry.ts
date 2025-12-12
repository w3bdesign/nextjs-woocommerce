/**
 * Family Registry
 *
 * Central registry of all available model families for the configurator.
 * Families group related model variants with dimension-based switching.
 *
 * Usage:
 * - Reference families by their ID (e.g., 'cabinet-family-01')
 * - Use getModelFamily() to retrieve family configurations
 * - Associate families with products via product.configurator.familyId
 *
 * Development Mode:
 * - All families are validated on app startup
 * - Invalid configurations are logged to console
 * - Prevents runtime errors from misconfigured families
 */

import type { ModelFamily } from '@/types/configurator';
import debug from '@/utils/debug';
import { validateFamily } from '@/utils/familyValidation';
import { CABINET_FAMILY } from './families/cabinetFamily.config';
import { DRESSER_FAMILY } from './families/dresserFamily.config';

/**
 * Family Registry
 *
 * Maps familyId to ModelFamily configuration.
 * Add new families here to make them available throughout the app.
 */
export const FAMILY_REGISTRY: Record<string, ModelFamily> = {
  'cabinet-family-01': CABINET_FAMILY,
  'dresser-family-01': DRESSER_FAMILY,

  // Add more families here as they become available:
  // 'sofa-family-01': SOFA_FAMILY,
  // etc.
};

/**
 * Default family ID to use when none is specified
 */
export const DEFAULT_FAMILY_ID = 'cabinet-family-01';

/**
 * Get a model family configuration by ID
 *
 * @param familyId - The unique family identifier
 * @returns The family configuration, or undefined if not found
 *
 * @example
 * const family = getModelFamily('cabinet-family-01');
 * if (family) {
 *   console.log('Variants:', family.variants.length);
 * }
 */
export function getModelFamily(familyId: string): ModelFamily | undefined {
  const family = FAMILY_REGISTRY[familyId];

  if (!family) {
    // Log available families to help debug
    debug.warn(
      `[FAMILY_REGISTRY] Family "${familyId}" not found.\n` +
        `Available families: ${Object.keys(FAMILY_REGISTRY).join(', ')}`,
    );
  }

  return family;
}

/**
 * Check if a family ID exists in the registry
 *
 * @param familyId - The family ID to check
 * @returns True if the family exists, false otherwise
 *
 * @example
 * if (hasFamily('cabinet-family-01')) {
 *   // Family exists, safe to use
 * }
 */
export function hasFamily(familyId: string): boolean {
  return familyId in FAMILY_REGISTRY;
}

/**
 * Get all available family IDs
 *
 * @returns Array of all registered family IDs
 *
 * @example
 * const families = getAvailableModelFamilies();
 * console.log('Available families:', families);
 */
export function getAvailableModelFamilies(): string[] {
  return Object.keys(FAMILY_REGISTRY);
}

/**
 * Development Mode Validation
 *
 * Validates all registered families on app startup (development only).
 * Catches configuration errors early before they cause runtime issues.
 *
 * Validates:
 * - All variant modelIds reference existing models in MODEL_REGISTRY
 * - Variant IDs are unique within each family
 * - ModelConfig dimension constraints are valid (min < max)
 * - ScalableAxes configuration is valid
 */
if (process.env.NODE_ENV === 'development') {
  // Validate all families on startup
  debug.log('[Family Registry] Validating family configurations...');

  let totalErrors = 0;
  let totalWarnings = 0;

  Object.entries(FAMILY_REGISTRY).forEach(([familyId, family]) => {
    const result = validateFamily(family);

    if (!result.valid) {
      debug.error(
        `[Family Registry] INVALID FAMILY: ${familyId}`,
        '\nErrors:',
        result.errors.join('\n  - '),
      );
      totalErrors += result.errors.length;
    } else {
      debug.log(`[Family Registry] ✓ ${familyId} validated successfully`);
    }

    if (result.warnings && result.warnings.length > 0) {
      debug.warn(
        `[Family Registry] WARNINGS for ${familyId}:`,
        '\n  - ' + result.warnings.join('\n  - '),
      );
      totalWarnings += result.warnings.length;
    }
  });

  // Summary
  const familyCount = Object.keys(FAMILY_REGISTRY).length;
  if (totalErrors === 0) {
    debug.log(
      `[Family Registry] ✓ All ${familyCount} families validated successfully`,
    );
    if (totalWarnings > 0) {
      debug.warn(
        `[Family Registry] Found ${totalWarnings} warning(s) - review recommended`,
      );
    }
  } else {
    debug.error(
      `[Family Registry] ✗ Validation failed with ${totalErrors} error(s)`,
    );
    debug.error(
      '[Family Registry] Fix configuration errors before deploying to production',
    );
  }
}
