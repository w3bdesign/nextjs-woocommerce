import { useSnapshot } from 'valtio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { configuratorState, updatePartColor } from '@/stores/configuratorStore';
import { COLOR_PALETTE } from './constants';

export default function ColorPalette() {
  const snap = useSnapshot(configuratorState);

  const handleColorSelect = (color: string) => {
    if (snap.current) {
      updatePartColor(snap.current, color);
    }
  };

  return (
    <Card className="m-0 rounded-none border-0 border-b">
      <CardContent className="p-6">
        <CardTitle className="text-sm font-semibold text-gray-900 mb-4">
          Color
        </CardTitle>

        {snap.current ? (
          <>
            <div className="grid grid-cols-8 gap-2 mb-4">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    snap.current && snap.items[snap.current] === color
                      ? 'border-white shadow-lg'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="bg-white rounded-lg px-4 py-3 border border-gray-200 mb-4">
              <p className="text-xs text-gray-500 mb-1">Selected Part</p>
              <h4 className="text-lg font-medium text-gray-800 capitalize">
                {snap.current || 'Unknown Part'}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {snap.current
                  ? snap.items[snap.current]?.toUpperCase() || '#FFFFFF'
                  : '#FFFFFF'}
              </p>
            </div>

            <Button variant="link" className="text-xs p-0 h-auto">
              Can&apos;t decide? Order samples
            </Button>
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
      </CardContent>
    </Card>
  );
}
