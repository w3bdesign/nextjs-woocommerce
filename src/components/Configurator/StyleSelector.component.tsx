import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getModelFamily } from '@/config/families.registry';
import {
  configuratorState,
  switchVariantManually,
} from '@/stores/configuratorStore';
import { useSnapshot } from 'valtio';

/**
 * Style Selector Component
 *
 * Displays family variants as selectable style buttons.
 * Replaces hardcoded style options with dynamic family variant configuration.
 * Manual variant selection triggers dimension reset to new variant's defaults.
 */
export default function StyleSelector() {
  const snap = useSnapshot(configuratorState);

  // Get family configuration from store
  const family = snap.familyId ? getModelFamily(snap.familyId) : undefined;

  // If no family is configured, don't render anything
  if (!family || family.variants.length === 0) {
    return null;
  }

  const handleVariantSelect = (variantId: string) => {
    switchVariantManually(variantId);
  };

  return (
    <Card className="m-0 rounded-none border-0 border-b">
      <CardContent className="p-6">
        <CardTitle className="text-sm font-semibold text-gray-900 mb-4">
          Variant
        </CardTitle>
        <div className="grid grid-cols-2 gap-2">
          {family.variants.map((variant) => (
            <Button
              key={variant.id}
              variant={
                snap.activeVariantId === variant.id ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => handleVariantSelect(variant.id)}
              className={`p-3 h-auto ${
                snap.activeVariantId === variant.id
                  ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <div className="text-xs font-medium">{variant.displayName}</div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
