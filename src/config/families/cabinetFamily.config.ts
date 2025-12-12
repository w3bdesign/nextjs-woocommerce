import type { ModelFamily } from '@/types/configurator';

/**
 * Cabinet Family Configuration
 *
 * Family: cabinet-family-01 (Cabinet Series A)
 *
 * This family represents the bar cabinet product line with variants
 * that differ in size and internal structure (drawer count, shelf configuration, etc.).
 *
 * Manual Variant Selection:
 * - Users manually select variants via Design Style tab buttons
 * - Each variant has independent dimension constraints defined in its ModelConfig
 * - Switching variants resets dimensions to the new variant's defaults
 * - No automatic switching based on dimension changes
 *
 * Current Variants:
 * - cabinet-small: Standard cabinet (cabinet.glb with 0.012 scale)
 * - cabinet-medium: Large cabinet (cabinet.glb with 0.015 scale)
 *
 * IMPORTANT: Both variants use the same model file (cabinet.glb) but with different scales.
 * cabinet-medium has a different default color (#ffffffff vs #8B4513) for visual distinction.
 *
 * Future Variants:
 * - Additional size variants or design variations as needed
 */
export const CABINET_FAMILY: ModelFamily = {
  /**
   * Unique family identifier
   * Used in WordPress product meta and GraphQL API
   */
  familyId: 'cabinet-family-01',

  /**
   * Human-readable family name
   * Displayed in WordPress admin and for debugging
   */
  displayName: 'Cabinet Series A',

  /**
   * Optional description for documentation/debugging
   */
  description:
    'Bar cabinet family with variable sizes and internal configurations',

  /**
   * Array of variants within this family
   * Users manually select variants via UI buttons
   */
  variants: [
    {
      /**
       * Unique variant identifier within family
       */
      id: 'cabinet-small',

      /**
       * Display name shown to users in variant selection UI
       */
      displayName: 'Standard Cabinet',

      /**
       * Reference to MODEL_REGISTRY key
       * Must exist in src/config/models.registry.ts
       */
      modelId: 'cabinet-v1',

      /**
       * Optional: Axes that can be scaled dynamically
       * Default: ['x', 'y', 'z'] (all axes scalable)
       */
      scalableAxes: ['x', 'y', 'z'],
    },

    {
      /**
       * Large variant identifier
       */
      id: 'cabinet-medium',

      /**
       * Display name shown to users in variant selection UI
       */
      displayName: 'Large Cabinet',

      /**
       * Reference to MODEL_REGISTRY key
       * Must exist in src/config/models.registry.ts
       */
      modelId: 'cabinet-v2',

      /**
       * Scalable axes - all axes including depth
       */
      scalableAxes: ['x', 'y', 'z'],
    },
  ],

  /**
   * Optional metadata about the family
   */
  metadata: {
    /**
     * Optional: Default variant to show on initial load
     * If not specified, first variant in array is used
     */
    defaultVariantId: 'cabinet-small',

    /**
     * Optional: Tags for categorization
     */
    tags: ['cabinet', 'storage', 'furniture'],
  },
};
