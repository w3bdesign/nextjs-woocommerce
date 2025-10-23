import {
  configuratorState,
  updateAllPartColors,
} from '@/stores/configuratorStore';
import type { ReactElement } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useSnapshot } from 'valtio';

/**
 * Color picker component for customizing 3D model colors globally
 * Applies selected color to the entire 3D model
 */
export default function ColorPicker(): ReactElement {
  const snap = useSnapshot(configuratorState);

  const currentColor = Object.values(snap.items)[0] || '#ffffff';

  const handleColorChange = (color: string): void => {
    updateAllPartColors(color);
  };

  return (
    <section className="p-4" aria-label="Color Picker">
      <div
        className="rounded-lg overflow-hidden shadow-md mx-auto"
        style={{ width: 'fit-content' }}
      >
        <HexColorPicker
          color={currentColor}
          onChange={handleColorChange}
          style={{
            width: '100%',
            maxWidth: '240px',
            height: '200px',
          }}
        />
      </div>
    </section>
  );
}
