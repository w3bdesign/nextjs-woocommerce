import type { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FloatingButtonProps {
  icon: ReactNode;
  tooltipText: string;
  onClick?: () => void;
  position: 'top-right' | 'bottom-right' | 'bottom-left' | 'bottom-left-2';
  ariaLabel: string;
  tooltipSide?: 'left' | 'right';
}

const positionMap: Record<FloatingButtonProps['position'], string> = {
  'top-right': 'top-4 right-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-left-2': 'bottom-4 left-20',
};

/**
 * Reusable floating button overlay for 3D canvas
 * Used for info, save, and door toggle controls
 */
export function FloatingButton({
  icon,
  tooltipText,
  onClick,
  position,
  ariaLabel,
  tooltipSide = 'left',
}: FloatingButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`absolute ${positionMap[position]} z-10 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all hover:scale-110`}
            aria-label={ariaLabel}
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} className="max-w-xs">
          <p className="text-sm">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
