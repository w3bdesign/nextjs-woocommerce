import {
  configuratorState,
  updateAllPartColors,
} from '@/stores/configuratorStore';
import { useSnapshot } from 'valtio';
import { COLOR_PALETTE } from './constants';

export default function ColorPalette() {
  const snap = useSnapshot(configuratorState);

  const currentColor = Object.values(snap.items)[0] || '#ffffff';

  const handleColorSelect = (color: string) => {
    updateAllPartColors(color);
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-8 gap-2">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => handleColorSelect(color)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              currentColor === color
                ? 'border-gray-800 shadow-lg scale-110'
                : 'border-gray-300 hover:border-gray-600'
            }`}
            style={{ backgroundColor: color }}
            title={`Color ${color}`}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
