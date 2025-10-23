import {
  configuratorState,
  toggleInteractivePart,
} from '@/stores/configuratorStore';
import type { InteractivePart } from '@/types/configurator';
import type { ReactElement } from 'react';
import { useSnapshot } from 'valtio';

interface InteractiveControlsProps {
  interactiveParts?: InteractivePart[];
}

/**
 * UI controls for interactive parts (doors, drawers, etc.)
 * Displays in sidebar as always-visible controls
 */
export default function InteractiveControls({
  interactiveParts,
}: InteractiveControlsProps): ReactElement | null {
  const snap = useSnapshot(configuratorState);

  if (!interactiveParts || interactiveParts.length === 0) {
    return null;
  }

  // Group parts by stateKey to avoid duplicate buttons
  const uniqueParts = new Map<string, InteractivePart>();
  interactiveParts.forEach((part) => {
    const key = part.stateKey || part.nodeName;
    if (!uniqueParts.has(key)) {
      uniqueParts.set(key, part);
    }
  });

  return (
    <section className="p-4" aria-label="Interactive Controls">
      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
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
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        Interactive Parts
      </h3>

      <div className="flex flex-col gap-2">
        {Array.from(uniqueParts.values()).map((part) => {
          const stateKey = part.stateKey || part.nodeName;
          const isActive =
            snap.interactiveStates[stateKey] ?? part.defaultState;

          return (
            <button
              key={stateKey}
              onClick={() => toggleInteractivePart(stateKey)}
              className={`
                px-4 py-3 rounded-md font-medium text-sm transition-all
                flex items-center justify-between
                ${
                  isActive
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              aria-pressed={isActive}
              aria-label={`${part.displayName} is ${isActive ? 'open' : 'closed'}`}
            >
              <span>{part.displayName}</span>
              <span
                className={`
                text-xs px-2 py-1 rounded-full font-semibold
                ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-300 text-gray-600'
                }
              `}
              >
                {isActive ? 'OPEN' : 'CLOSED'}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-gray-500 text-center">
        Click buttons to toggle parts
      </p>
    </section>
  );
}
