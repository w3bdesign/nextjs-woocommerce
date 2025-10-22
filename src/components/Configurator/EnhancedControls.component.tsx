import { useSnapshot } from 'valtio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  RotateCcw,
  Settings,
  Shield,
} from 'lucide-react';
import {
  configuratorState,
  resetDimensions,
  toggleInteractivePart,
} from '@/stores/configuratorStore';
import type { EnhancedControlsProps } from './types';
import PricingSection from './PricingSection.component';
import StyleSelector from './StyleSelector.component';
import DimensionSlider from './DimensionSlider.component';
import ColorPalette from './ColorPalette.component';

/**
 * Enhanced configurator controls - refactored for maintainability
 * Follows SOLID principles with clear separation of concerns
 */
export default function EnhancedControls({
  modelConfig,
  product,
}: EnhancedControlsProps) {
  const snap = useSnapshot(configuratorState);

  const handleResetDimensions = () => {
    if (modelConfig?.dimensions) {
      resetDimensions(modelConfig);
    }
  };

  return (
    <aside
      className="w-full xl:w-96 bg-white border-t xl:border-t-0 xl:border-l border-gray-200 overflow-y-auto"
      style={{ maxHeight: '700px' }}
    >
      {/* Instructions */}
      <Card className="m-0 rounded-none border-0 border-b">
        <CardContent className="p-4 bg-blue-50">
          <div className="text-center">
            <p className="text-sm text-blue-800 font-medium mb-1">
              🎨 How to customize
            </p>
            <p className="text-xs text-blue-600">
              Click on the 3D model to select parts, then use the controls below
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Section */}
      <PricingSection product={product} />

      {/* Style Selection */}
      <StyleSelector />

      {/* Dimension Controls */}
      {modelConfig?.dimensions && (
        <Card className="m-0 rounded-none border-0 border-b">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Dimensions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetDimensions}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>

            <div className="space-y-4">
              <DimensionSlider
                type="width"
                modelConfig={modelConfig}
                label="Width"
              />
              <DimensionSlider
                type="height"
                modelConfig={modelConfig}
                label="Height"
              />
              <DimensionSlider
                type="depth"
                modelConfig={modelConfig}
                label="Depth"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Parts */}
      {modelConfig?.interactiveParts &&
        modelConfig.interactiveParts.length > 0 && (
          <Card className="m-0 rounded-none border-0 border-b">
            <CardContent className="p-6">
              <CardTitle className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Interactive Parts
              </CardTitle>
              <div className="space-y-2">
                {modelConfig.interactiveParts
                  .filter(
                    (part, index, self) =>
                      self.findIndex(
                        (p) =>
                          (p.stateKey || p.nodeName) ===
                          (part.stateKey || part.nodeName),
                      ) === index,
                  )
                  .map((part) => {
                    const stateKey = part.stateKey || part.nodeName;
                    const isActive =
                      snap.interactiveStates[stateKey] ?? part.defaultState;

                    return (
                      <Button
                        key={stateKey}
                        variant={isActive ? 'default' : 'outline'}
                        onClick={() => toggleInteractivePart(stateKey)}
                        className={`w-full justify-between ${
                          isActive
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        <span>{part.displayName}</span>
                        <Badge variant={isActive ? 'default' : 'secondary'}>
                          {isActive ? 'OPEN' : 'CLOSED'}
                        </Badge>
                      </Button>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Color Selection */}
      <ColorPalette />

      {/* Action Buttons */}
      <Card className="m-0 rounded-none border-0 border-b">
        <CardContent className="p-6 space-y-3">
          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 px-6 h-auto">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>

          <Button
            variant="outline"
            className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold py-4 px-6 h-auto"
          >
            <Heart className="w-5 h-5 mr-2" />
            Save Configuration
          </Button>
        </CardContent>
      </Card>

      {/* Product Information */}
      <Card className="m-0 rounded-none border-0">
        <CardContent className="p-6 bg-gray-50">
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Produced in EU</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Shipping within 3-4 weeks</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>Delivery time depends on chosen color</span>
            </div>
          </div>
          <Button variant="link" className="text-xs p-0 h-auto mt-3">
            Payment information
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}
