import type { ModelFamily } from '@/types/configurator';

/**
 * Cabinet Family Configuration
 *
 * Family: cabinet-family-01 (Cabinet Series A)
 *
 * This family represents the bar cabinet product line with variants
 * that differ in size and internal structure (drawer count, shelf configuration, etc.).
 *
 * Dimension-Driven Variant Switching:
 * - Width and height changes trigger automatic variant switching
 * - Depth changes NEVER trigger variant switching (depth scales independently)
 * - Each variant defines its valid dimension ranges (constraints)
 * - System automatically selects best-matching variant based on user's dimension choices
 *
 * Current Variants:
 * - cabinet-small: Compact cabinet (80-110cm width, 100-140cm height)
 *
 * Future Variants (to be added):
 * - cabinet-medium: Standard cabinet with 3 drawers (110-150cm width, 140-180cm height)
 * - cabinet-large: Large cabinet with additional storage (150-180cm width, 180-200cm height)
 *
 * Note: Currently MVP with single variant. Structure ready for multi-variant expansion.
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
   * Each variant represents a distinct 3D model with specific dimension constraints
   */
  variants: [
    {
      /**
       * Unique variant identifier within family
       */
      id: 'cabinet-small',

      /**
       * Display name shown to users in configurator UI
       * Example: "Small (2 Drawers)" or "Compact"
       */
      displayName: 'Standard Cabinet',

      /**
       * Reference to MODEL_REGISTRY key
       * Must exist in src/config/models.registry.ts
       */
      modelId: 'cabinet-v1',

      /**
       * Dimension constraints that define when this variant is active
       * All values in centimeters
       *
       * CRITICAL: Only width and height trigger variant switching
       * Depth constraints are for validation/display only
       */
      constraints: {
        /**
         * Width range (X-axis, side-to-side)
         * [min, max] in cm
         * Triggers variant switch when user adjusts width slider
         */
        width: [80, 180],

        /**
         * Height range (Y-axis, vertical)
         * [min, max] in cm
         * Triggers variant switch when user adjusts height slider
         */
        height: [100, 200],

        /**
         * Depth range (Z-axis, front-to-back)
         * [min, max] in cm
         * NEVER triggers variant switch - depth scales independently
         */
        depth: [35, 60],
      },

      /**
       * Optional: Axes that can be scaled dynamically
       * Default: ['x', 'y', 'z'] (all axes scalable)
       *
       * For this cabinet:
       * - X (width): Scalable - cabinet can be wider/narrower
       * - Y (height): Scalable - cabinet can be taller/shorter
       * - Z (depth): Locked at model's natural proportions to prevent distortion
       *
       * Locking Z-axis ensures cabinet depth remains proportional even as
       * width/height change, preventing visual distortion
       */
      scalableAxes: ['x', 'y'],
    },

    // Additional variants to be added here as new models become available:
    //
    // {
    //   id: 'cabinet-medium',
    //   displayName: 'Medium (3 Drawers)',
    //   modelId: 'cabinet-v2', // References cabinets-2.glb once configured
    //   constraints: {
    //     width: [110, 150],
    //     height: [140, 180],
    //     depth: [35, 60],
    //   },
    //   scalableAxes: ['x', 'y'],
    // },
    //
    // {
    //   id: 'cabinet-large',
    //   displayName: 'Large (4 Drawers)',
    //   modelId: 'cabinet-v3',
    //   constraints: {
    //     width: [150, 180],
    //     height: [180, 200],
    //     depth: [35, 60],
    //   },
    //   scalableAxes: ['x', 'y'],
    // },
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
