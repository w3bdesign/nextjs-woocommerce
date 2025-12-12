/**
 * Dresser Family Configuration
 *
 * Single-variant family for the bedroom dresser model.
 * This uses the family system for architectural consistency,
 * even though only one variant exists.
 */

import type { ModelFamily } from '@/types/configurator';

export const DRESSER_FAMILY: ModelFamily = {
  familyId: 'dresser-family-01',
  name: 'Bedroom Dresser',
  description: 'Bedroom storage dresser with customizable colors',

  variants: [
    {
      id: 'dresser-standard',
      displayName: 'Standard Dresser',
      modelId: 'dresser-v1',
      scalableAxes: [], // No dimensional scaling for dresser
    },
  ],

  metadata: {
    defaultVariantId: 'dresser-standard',
    category: 'furniture',
    tags: ['bedroom', 'storage', 'dresser'],
  },
};
