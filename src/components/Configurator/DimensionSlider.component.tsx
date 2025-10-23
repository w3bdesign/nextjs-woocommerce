import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { configuratorState, setDimension } from '@/stores/configuratorStore';
import type { ModelConfig } from '@/types/configurator';
import { useSnapshot } from 'valtio';

interface DimensionSliderProps {
  type: 'width' | 'height' | 'depth';
  modelConfig: ModelConfig;
  label: string;
}

const DIMENSION_COLORS = {
  width: { label: 'text-blue-600', badge: 'bg-blue-50 text-blue-700' },
  height: { label: 'text-green-600', badge: 'bg-green-50 text-green-700' },
  depth: { label: 'text-red-600', badge: 'bg-red-50 text-red-700' },
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
    setDimension(type, value[0]);
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
