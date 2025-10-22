import type { InteractivePart } from '@/types/configurator';

/**
 * Find an interactive part by direction (left/right)
 * Searches in displayName and nodeName properties
 */
export const findDoorPart = (
  direction: 'left' | 'right',
  interactiveParts?: InteractivePart[],
): InteractivePart | undefined => {
  return interactiveParts?.find(
    (p) =>
      p.displayName?.toLowerCase().includes(direction) ||
      p.nodeName?.toLowerCase().includes(direction),
  );
};

/**
 * Get state key for an interactive part
 * Prioritizes stateKey over nodeName
 */
export const getPartStateKey = (part: InteractivePart): string => {
  return part.stateKey || part.nodeName;
};
