import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { configuratorState, setDimensions } from '@/stores/configuratorStore';
import type { ModelConfig } from '@/types/configurator';
import { useSnapshot } from 'valtio';

interface DimensionSliderProps {
  type: 'length' | 'width' | 'height';
  modelConfig: ModelConfig;
  label: string;
}

const DIMENSION_COLORS = {
  length: { label: 'text-red-600', badge: 'bg-red-50 text-red-700' },
  width: { label: 'text-blue-600', badge: 'bg-blue-50 text-blue-700' },
  height: { label: 'text-green-600', badge: 'bg-green-50 text-green-700' },
} as const;

export default function DimensionSlider({
  type,
  modelConfig,
  label,
}: DimensionSliderProps) {
  const snap = useSnapshot(configuratorState);
  const dimensions = modelConfig.dimensions?.[type];

  if (!dimensions) return null;

  const handleChange = (value: number[]) => {
    // Read from configuratorState directly (not snap) to avoid stale values
    // This ensures dimensions remain independent during rapid updates
    setDimensions({
      width: type === 'width' ? value[0] : configuratorState.dimensions.width,
      height:
        type === 'height' ? value[0] : configuratorState.dimensions.height,
      depth: type === 'length' ? value[0] : configuratorState.dimensions.length,
    });
  };

  const colorClasses = DIMENSION_COLORS[type];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={`text-sm font-medium ${colorClasses.label}`}>
          {label}
        </label>
        <Badge variant="secondary" className={colorClasses.badge}>
          {snap.dimensions[type]} cm
        </Badge>
      </div>
      <Slider
        min={dimensions.min}
        max={dimensions.max}
        step={dimensions.step}
        value={[snap.dimensions[type]]}
        onValueChange={handleChange}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{dimensions.min} cm</span>
        <span>{dimensions.max} cm</span>
      </div>
    </div>
  );
}
