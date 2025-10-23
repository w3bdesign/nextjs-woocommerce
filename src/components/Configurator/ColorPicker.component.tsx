import { configuratorState, updatePartColor } from '@/stores/configuratorStore';
import type { ReactElement } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useSnapshot } from 'valtio';

/**
 * Color picker component for customizing 3D model parts
 * Displays in sidebar when integrated in ProductConfigurator
 */
export default function ColorPicker(): ReactElement {
  const snap = useSnapshot(configuratorState);

  const handleColorChange = (color: string): void => {
    if (snap.current) {
      updatePartColor(snap.current, color);
    }
  };

  return (
    <section className="p-4 border-b border-gray-200" aria-label="Color Picker">
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">
        Color Customization
      </h3>

      {snap.current ? (
        <>
          <div
            className="mb-4 rounded-lg overflow-hidden shadow-md mx-auto"
            style={{ width: 'fit-content' }}
          >
            <HexColorPicker
              color={snap.items[snap.current] || '#ffffff'}
              onChange={handleColorChange}
              style={{
                width: '100%',
                maxWidth: '240px',
                height: '200px',
              }}
            />
          </div>

          <div className="bg-white rounded-lg px-4 py-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Selected Part</p>
            <h4 className="text-lg font-medium text-gray-800 capitalize">
              {snap.current}
            </h4>
            <p className="text-xs text-gray-400 mt-1">
              {snap.items[snap.current]?.toUpperCase()}
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-8 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 font-medium mb-1">
            Select a Part
          </p>
          <p className="text-xs text-gray-400">
            Click on the 3D model to customize colors
          </p>
        </div>
      )}
    </section>
  );
}
