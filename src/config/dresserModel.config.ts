import type { ModelConfig } from '@/types/configurator';

/**
 * Dresser Model Configuration
 *
 * Model: game_ready_free_bedroom_shelf.glb
 * Mesh/node names discovered via glTF inspection:
 * - Base_Bedroom_Shelf_0
 * - Box_01_Bedroom_Shelf_0 ... Box_06_Bedroom_Shelf_0
 * Material(s): Bedroom_Shelf
 * Notes: Asset contains a short animation ("Take 001") and uses
 * KHR_materials_specular. We disable automatic animation playback
 * and expose material for simple color customization.
 */
export const DRESSER_CONFIG: ModelConfig = {
  id: 'dresser-v1',
  name: 'Bedroom Dresser',
  modelPath: '/game_ready_free_bedroom_shelf.glb',

  // Parts available for simple color/material overrides.
  // We map the top-level base mesh and the box meshes so UI can target them.
  parts: [
    {
      nodeName: 'Base_Bedroom_Shelf_0',
      materialName: 'Bedroom_Shelf',
      displayName: 'Dresser Base',
      defaultColor: '#C19A6B', // light wood tone
    },
    {
      nodeName: 'Box_01_Bedroom_Shelf_0',
      materialName: 'Bedroom_Shelf',
      displayName: 'Dresser Box 1',
      defaultColor: '#C19A6B',
    },
    {
      nodeName: 'Box_02_Bedroom_Shelf_0',
      materialName: 'Bedroom_Shelf',
      displayName: 'Dresser Box 2',
      defaultColor: '#C19A6B',
    },
    {
      nodeName: 'Box_03_Bedroom_Shelf_0',
      materialName: 'Bedroom_Shelf',
      displayName: 'Dresser Box 3',
      defaultColor: '#C19A6B',
    },
    {
      nodeName: 'Box_04_Bedroom_Shelf_0',
      materialName: 'Bedroom_Shelf',
      displayName: 'Dresser Box 4',
      defaultColor: '#C19A6B',
    },
    {
      nodeName: 'Box_05_Bedroom_Shelf_0',
      materialName: 'Bedroom_Shelf',
      displayName: 'Dresser Box 5',
      defaultColor: '#C19A6B',
    },
    {
      nodeName: 'Box_06_Bedroom_Shelf_0',
      materialName: 'Bedroom_Shelf',
      displayName: 'Dresser Box 6',
      defaultColor: '#C19A6B',
    },
  ],

  // This asset is authored at reasonable scale; keep scale small to fit the scene.
  scale: 0.012,
  // Position the dresser so its back edge sits near the room wall (same strategy
  // used by the cabinet config). This prevents the dresser from appearing dead
  // center on the floor and gives consistent framing with the wall silhouette.
  // Keep Y = 0 (base) so ground plane remains at floor level; changing the
  // model's Y in the config will also move the ground plane (Canvas3D uses
  // modelConfig.position[1] as the default ground Y), so avoid adjusting Y
  // unless you intentionally want the floor to move.
  position: [0, 0.45, -3.4],

  // Explicit shadow/ground configuration to keep the ground plane fixed at
  // Y = 0 for this model. This prevents accidental movement of the floor if
  // the model position is adjusted elsewhere in code or UI.
  shadow: {
    position: 0,
    opacity: 0.25,
    scale: 10,
  },
  // Corrective rotation: the source GLB nodes contain a -90° rotation around X
  // (quaternion ~= [-0.707, 0, 0, 0.707]) which pitches the geometry onto its
  // back. Apply the opposite rotation to cancel that per-node rotation so the
  // dresser stands upright in the viewer.
  // Use +90° (Math.PI/2) around X to cancel the exported -90°.
  rotation: [Math.PI / 2, Math.PI / 2, 0],

  camera: {
    position: [-5, 0, 11], // Base camera position
    fov: 17,
  },

  animations: {
    // don't enable auto-rotation or bobbing for furniture
    enableRotation: false,
    enableBobbing: false,
    // runtime should ignore/disable any embedded animations by default
  },

  // No interactive door parts for this model
  interactiveParts: [],

  metadata: {
    description:
      'Bedroom dresser model (single product) — color customization supported',
    tags: ['furniture', 'dresser', 'storage'],
    version: '1.0.0',
  },
};

export default DRESSER_CONFIG;
