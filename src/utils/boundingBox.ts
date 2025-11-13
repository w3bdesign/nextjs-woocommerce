/**
 * Bounding Box Utility Functions
 *
 * Centralized calculations for 3D bounding boxes to eliminate duplication
 * across ModelViewer, cameraStore, and other components.
 */

export interface WorldBoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

export interface BoundingBoxSize {
  width: number;
  height: number;
  depth: number;
}

export interface BoundingBoxCenter {
  x: number;
  y: number;
  z: number;
}

/**
 * Calculate the dimensions (width, height, depth) of a bounding box
 *
 * @param box - The bounding box with min and max coordinates
 * @returns Object with width (x-axis), height (y-axis), and depth (z-axis) dimensions
 *
 * @example
 * const size = calculateBoundingBoxSize(boundingBox);
 * console.log(`Width: ${size.width}, Height: ${size.height}, Depth: ${size.depth}`);
 */
export const calculateBoundingBoxSize = (
  box: WorldBoundingBox,
): BoundingBoxSize => {
  return {
    width: Math.abs(box.max.x - box.min.x),
    height: Math.abs(box.max.y - box.min.y),
    depth: Math.abs(box.max.z - box.min.z),
  };
};

/**
 * Calculate the center point of a bounding box
 *
 * @param box - The bounding box with min and max coordinates
 * @returns The center point as {x, y, z} coordinates
 *
 * @example
 * const center = calculateBoundingBoxCenter(boundingBox);
 * camera.lookAt(center.x, center.y, center.z);
 */
export const calculateBoundingBoxCenter = (
  box: WorldBoundingBox,
): BoundingBoxCenter => {
  return {
    x: (box.min.x + box.max.x) / 2,
    y: (box.min.y + box.max.y) / 2,
    z: (box.min.z + box.max.z) / 2,
  };
};

/**
 * Calculate both size and center of a bounding box in one call
 * Useful when you need both measurements to avoid recalculation
 *
 * @param box - The bounding box with min and max coordinates
 * @returns Object containing both size and center
 *
 * @example
 * const { size, center } = calculateBoundingBoxDimensions(boundingBox);
 * console.log(`Box at (${center.x}, ${center.y}, ${center.z})`);
 * console.log(`Size: ${size.width} x ${size.height} x ${size.depth}`);
 */
export const calculateBoundingBoxDimensions = (box: WorldBoundingBox) => {
  return {
    size: calculateBoundingBoxSize(box),
    center: calculateBoundingBoxCenter(box),
  };
};

/**
 * Check if a bounding box is valid (max > min for all axes)
 * Useful for validation before performing calculations
 *
 * @param box - The bounding box to validate
 * @returns true if the box is valid, false otherwise
 */
export const isValidBoundingBox = (box: WorldBoundingBox): boolean => {
  return (
    box.max.x > box.min.x && box.max.y > box.min.y && box.max.z > box.min.z
  );
};

/**
 * Calculate the volume of a bounding box
 *
 * @param box - The bounding box with min and max coordinates
 * @returns Volume in cubic units
 */
export const calculateBoundingBoxVolume = (box: WorldBoundingBox): number => {
  const size = calculateBoundingBoxSize(box);
  return size.width * size.height * size.depth;
};

/**
 * Get the diagonal length of a bounding box
 * Useful for camera distance calculations
 *
 * @param box - The bounding box with min and max coordinates
 * @returns Diagonal length from min to max corner
 */
export const calculateBoundingBoxDiagonal = (box: WorldBoundingBox): number => {
  const size = calculateBoundingBoxSize(box);
  return Math.sqrt(size.width ** 2 + size.height ** 2 + size.depth ** 2);
};
