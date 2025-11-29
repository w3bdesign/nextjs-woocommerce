import { Slider } from '@/components/ui/slider';
import { getModelConfig } from '@/config/models.registry';
import {
  configuratorState,
  resetDimensions,
  setDimension,
} from '@/stores/configuratorStore';
import { RotateCcw } from 'lucide-react';
import type { ReactElement } from 'react';
import { useSnapshot } from 'valtio';

interface DimensionControlsProps {
  modelId: string;
}

/**
 * Dimension controls for adjusting 3D model size
 * Shows width, height, depth sliders with model-specific constraints
 */
export default function DimensionControls({
  modelId,
}: DimensionControlsProps): ReactElement | null {
  const snap = useSnapshot(configuratorState);
  const modelConfig = getModelConfig(modelId);

  // Don't render if model doesn't have dimension constraints
  if (!modelConfig?.dimensions) {
    return null;
  }

  const { dimensions } = modelConfig;

  const handleDimensionChange = (
    axis: 'length' | 'width' | 'height',
    value: number[],
  ): void => {
    setDimension(axis, value[0]);
  };

  const handleReset = (): void => {
    resetDimensions(modelConfig);
  };

  return (
    <section
      className="p-4 border-t border-gray-200"
      aria-label="Dimension Controls"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
          Dimensions
        </h3>
        <button
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          aria-label="Reset dimensions to default"
          title="Reset dimensions"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      <div className="space-y-4">
        {/* Length Slider (Depth/Z axis) - WooCommerce standard */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="dimension-length"
              className="text-sm font-medium text-red-600 flex items-center gap-1"
            >
              <span>Length</span>
              <span className="text-xs text-gray-400">(Depth/Z)</span>
            </label>
            <span className="text-sm font-mono text-gray-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {snap.dimensions.length} cm
            </span>
          </div>
          <Slider
            id="dimension-length"
            min={dimensions.length.min}
            max={dimensions.length.max}
            step={dimensions.length.step}
            value={[snap.dimensions.length]}
            onValueChange={(value) => handleDimensionChange('length', value)}
            className="w-full"
            aria-label="Length (depth) in centimeters"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{dimensions.length.min} cm</span>
            <span>{dimensions.length.max} cm</span>
          </div>
        </div>

        {/* Width Slider (X axis) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="dimension-width"
              className="text-sm font-medium text-blue-600 flex items-center gap-1"
            >
              <span>Width</span>
              <span className="text-xs text-gray-400">(X)</span>
            </label>
            <span className="text-sm font-mono text-gray-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {snap.dimensions.width} cm
            </span>
          </div>
          <Slider
            id="dimension-width"
            min={dimensions.width.min}
            max={dimensions.width.max}
            step={dimensions.width.step}
            value={[snap.dimensions.width]}
            onValueChange={(value) => handleDimensionChange('width', value)}
            className="w-full"
            aria-label="Width in centimeters"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{dimensions.width.min} cm</span>
            <span>{dimensions.width.max} cm</span>
          </div>
        </div>

        {/* Height Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="dimension-height"
              className="text-sm font-medium text-green-600 flex items-center gap-1"
            >
              <span>Height</span>
              <span className="text-xs text-gray-400">(Y)</span>
            </label>
            <span className="text-sm font-mono text-gray-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
              {snap.dimensions.height} cm
            </span>
          </div>
          <Slider
            id="dimension-height"
            min={dimensions.height.min}
            max={dimensions.height.max}
            step={dimensions.height.step}
            value={[snap.dimensions.height]}
            onValueChange={(value) => handleDimensionChange('height', value)}
            className="w-full"
            aria-label="Height in centimeters"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{dimensions.height.min} cm</span>
            <span>{dimensions.height.max} cm</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500 text-center">
        Adjust dimensions to customize your furniture
      </p>
    </section>
  );
}
