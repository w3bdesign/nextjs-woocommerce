import type { ModelConfig } from '@/types/configurator';

/**
 * Cabinet Model Configuration - ROTATION ANIMATION VERSION
 *
 * This version attempts to use rotation animations instead of mesh swapping.
 *
 * ⚠️ NOTE: This may not work perfectly if the door meshes don't have
 * proper pivot points at the hinges. If doors rotate around the wrong
 * point, the GLB model needs to be fixed in Blender.
 *
 * To use this version:
 * 1. Rename cabinetModel.config.ts to cabinetModel.config.old.ts
 * 2. Rename this file to cabinetModel.config.ts
 * 3. Refresh browser and test
 * 4. Adjust rotation values based on results
 */
export const CABINET_CONFIG: ModelConfig = {
  id: 'cabinet-v1',
  name: 'Bar Cabinet',
  modelPath: '/cabinet.glb',

  parts: [
    {
      nodeName: 'Cabinet_m_cabinet_0',
      materialName: 'm_cabinet',
      displayName: 'Cabinet Body',
      defaultColor: '#8B4513',
    },
    // Note: Door meshes are now ALSO listed as regular parts
    // so they can be colored AND animated
    {
      nodeName: 'Door_Closed_Left_m_cabinet_0',
      materialName: 'm_cabinet',
      displayName: 'Left Door',
      defaultColor: '#8B4513',
    },
    {
      nodeName: 'Door_Closed_Right_m_cabinet_0',
      materialName: 'm_cabinet',
      displayName: 'Right Door',
      defaultColor: '#8B4513',
    },
  ],

  // Interactive parts with ROTATION animation (not visibility toggle)
  interactiveParts: [
    // Left door - rotates on Y axis
    {
      nodeName: 'Door_Closed_Left_m_cabinet_0',
      materialName: 'm_cabinet',
      displayName: 'Left Door',
      stateKey: 'leftDoor',
      defaultState: false, // Closed

      // NO visibility toggle - door stays visible and rotates
      visibilityToggle: false,

      // Closed position
      inactiveState: {
        rotation: [0, 0, 0], // Straight
        position: [0, 0, 0],
      },

      // Open position - try different rotation values if this doesn't work:
      // [0, Math.PI / 2, 0]     = 90° right
      // [0, -Math.PI / 2, 0]    = 90° left
      // [0, Math.PI / 3, 0]     = 60° right
      // [Math.PI / 2, 0, 0]     = 90° upward
      activeState: {
        rotation: [0, Math.PI / 2, 0], // Try rotating 90° on Y axis
        position: [0, 0, 0],
      },

      animationDuration: 600, // 600ms smooth animation
    },

    // Right door - opposite direction
    {
      nodeName: 'Door_Closed_Right_m_cabinet_0',
      materialName: 'm_cabinet',
      displayName: 'Right Door',
      stateKey: 'rightDoor',
      defaultState: false,
      visibilityToggle: false,

      inactiveState: {
        rotation: [0, 0, 0],
        position: [0, 0, 0],
      },

      // Try opposite direction for right door
      activeState: {
        rotation: [0, -Math.PI / 2, 0], // 90° opposite direction
        position: [0, 0, 0],
      },

      animationDuration: 600,
    },
  ],

  scale: 0.012,
  position: [0, -1.0, 0],

  camera: {
    position: [0, 0.5, 10],
    fov: 50,
  },

  animations: {
    enableRotation: false,
    enableBobbing: false,
  },

  shadow: {
    position: -1.0,
    opacity: 0.5,
    scale: 8,
    blur: 2.5,
  },

  metadata: {
    description: 'Bar cabinet with ROTATION-animated doors',
    tags: ['furniture', 'cabinet', 'storage', 'animated-doors'],
    version: '2.0.0',
  },
};
