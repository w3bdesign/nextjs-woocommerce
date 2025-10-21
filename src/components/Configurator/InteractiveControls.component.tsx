import { useState, type ReactElement } from 'react';
import { useSnapshot } from 'valtio';
import { configuratorState, toggleInteractivePart } from '@/stores/configuratorStore';
import type { InteractivePart } from '@/types/configurator';

interface InteractiveControlsProps {
  interactiveParts?: InteractivePart[];
}

/**
 * UI controls for interactive parts (doors, drawers, etc.)
 * Displays buttons to toggle interactive elements in a collapsible panel
 */
export default function InteractiveControls({ 
  interactiveParts 
}: InteractiveControlsProps): ReactElement | null {
  const snap = useSnapshot(configuratorState);
  const [isOpen, setIsOpen] = useState(true);
  
  if (!interactiveParts || interactiveParts.length === 0) {
    return null;
  }
  
  // Group parts by stateKey to avoid duplicate buttons
  const uniqueParts = new Map<string, InteractivePart>();
  interactiveParts.forEach(part => {
    const key = part.stateKey || part.nodeName;
    if (!uniqueParts.has(key)) {
      uniqueParts.set(key, part);
    }
  });
  
  return (
    <div className="fixed top-20 right-4 z-10 max-w-xs">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-2 w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-between font-medium"
        aria-label="Toggle Interactive Controls"
      >
        <span className="flex items-center gap-2">
          <svg 
            className="w-5 h-5" 
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
          Interactive Controls
        </span>
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 9l-7 7-7-7" 
          />
        </svg>
      </button>
      
      {/* Collapsible Panel */}
      <div 
        className={`
          bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden
          transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Toggle Parts
          </h3>
          
          <div className="flex flex-col gap-2">
            {Array.from(uniqueParts.values()).map((part) => {
              const stateKey = part.stateKey || part.nodeName;
              const isActive = snap.interactiveStates[stateKey] ?? part.defaultState;
              
              return (
                <button
                  key={stateKey}
                  onClick={() => toggleInteractivePart(stateKey)}
                  className={`
                    px-4 py-3 rounded-md font-medium text-sm transition-all
                    flex items-center justify-between
                    ${isActive 
                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{part.displayName}</span>
                  <span className={`
                    text-xs px-2 py-1 rounded-full font-semibold
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-gray-300 text-gray-600'
                    }
                  `}>
                    {isActive ? 'OPEN' : 'CLOSED'}
                  </span>
                </button>
              );
            })}
          </div>
          
          <p className="mt-3 text-xs text-gray-500 text-center">
            Click to open/close parts
          </p>
        </div>
      </div>
    </div>
  );
}
