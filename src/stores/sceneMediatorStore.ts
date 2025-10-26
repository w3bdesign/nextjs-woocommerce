import { proxy } from 'valtio';

/**
 * Scene mediator store
 * Holds world-aligned model state used by environment systems (camera, overlays)
 * This store is the single source of truth for the model's world geometry
 * and intentionally separate from configuratorState which holds only
 * user-driven configuration (colors, interactive part states, dimensions).
 */
export interface WorldBoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

interface SceneMediator {
  /** Latest world-aligned model bounding box (or null if not computed) */
  modelWorld: {
    boundingBox: WorldBoundingBox;
    position: [number, number, number];
    height: number; // computed height in world units
    scale: number; // effective scale applied to geometry
  } | null;
}

export const sceneMediator = proxy<SceneMediator>({
  modelWorld: null,
});

/**
 * Publish the computed world-aligned bounding box and related metadata.
 * Model viewers should call this once they have a stable bounding box.
 */
export const setModelWorld = (
  boundingBox: WorldBoundingBox,
  position: [number, number, number],
  scale = 1,
): void => {
  const height = boundingBox.max.y - boundingBox.min.y;
  sceneMediator.modelWorld = { boundingBox, position, height, scale };
};

export const clearModelWorld = (): void => {
  sceneMediator.modelWorld = null;
};

export default sceneMediator;
