import type { ReactElement } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useSnapshot } from 'valtio';
import { configuratorState, updatePartColor } from '@/stores/configuratorStore';

/**
 * Color picker component for customizing 3D model parts
 * Displays when a part is selected
 */
export default function ColorPicker(): ReactElement {
  const snap = useSnapshot(configuratorState);

  const handleColorChange = (color: string): void => {
    if (snap.current) {
      updatePartColor(snap.current, color);
    }
  };

  return (
    <div
      className="fixed top-20 left-8 z-50 transition-opacity duration-300"
      style={{
        display: snap.current ? 'block' : 'none',
        opacity: snap.current ? 1 : 0,
      }}
    >
      {/* Color Picker */}
      <div className="mb-4 shadow-xl rounded-lg overflow-hidden">
        <HexColorPicker
          color={snap.current ? snap.items[snap.current] : '#ffffff'}
          onChange={handleColorChange}
          style={{
            width: '200px',
            height: '200px',
          }}
        />
      </div>

      {/* Part Name Label */}
      {snap.current && (
        <div className="bg-white shadow-lg rounded-lg px-6 py-4">
          <h2 className="text-4xl font-light tracking-tight text-gray-800 capitalize">
            {snap.current}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Click to customize
          </p>
        </div>
      )}
    </div>
  );
}
