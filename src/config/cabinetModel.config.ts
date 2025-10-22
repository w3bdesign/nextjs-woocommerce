import type { ModelConfig } from '@/types/configurator';

/**
 * Cabinet Model Configuration
 *
 * Configuration for the bar cabinet 3D model with customizable parts.
 *
 * Model: cabinet.glb
 * Structure:
 * - Cabinet_m_cabinet_0: Main cabinet body
 * - Door_Closed_Left_m_cabinet_0: Left door (closed state)
 * - Door_Closed_Right_m_cabinet_0: Right door (closed state)
 * - Door_Left_m_cabinet_0: Left door (open state)
 * - Door_Right_m_cabinet_0: Right door (open state)
 *
 * Note: Currently only supports color customization.
 * Door open/close states would require additional functionality.
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
      defaultColor: '#8B4513', // Saddle brown - natural wood color
    },
  ],

  // Interactive parts that can be toggled
  // Each door has 2 meshes (closed and open) that share a stateKey
  // When state is FALSE (closed): show closed mesh, hide open mesh
  // When state is TRUE (open): hide closed mesh, show open mesh
  interactiveParts: [
    // Left door - closed mesh (visible when state = false/closed)
    {
      nodeName: 'Door_Closed_Left_m_cabinet_0',
      materialName: 'm_cabinet',
      displayName: 'Left Door',
      stateKey: 'leftDoor', // Shared state key
      group: 'doors',
      defaultState: false, // FALSE = closed (show this mesh)
      visibilityToggle: true,
      invertVisibility: true, // Show when INACTIVE (closed)
      inactiveState: { rotation: [0, 0, 0], position: [0, 0, 0] },
      activeState: { rotation: [0, 0, 0], position: [0, 0, 0] },
      animationDuration: 300,
    },
    // Left door - open mesh (visible when state = true/open)
    {
      nodeName: 'Door_Left_m_cabinet_0',
      materialName: 'm_cabinet',
      displayName: 'Left Door',
      stateKey: 'leftDoor', // Same state key as closed mesh
      group: 'doors',
      defaultState: false, // FALSE = closed (hide this mesh)
      visibilityToggle: true,
      invertVisibility: false, // Show when ACTIVE (open)
      inactiveState: { rotation: [0, 0, 0], position: [0, 0, 0] },
      activeState: { rotation: [0, 0, 0], position: [0, 0, 0] },
      animationDuration: 300,
    },
    // Right door - closed mesh
    {
      nodeName: 'Door_Closed_Right_m_cabinet_0',
      materialName: 'm_cabinet',
      displayName: 'Right Door',
      stateKey: 'rightDoor',
      group: 'doors',
      defaultState: false, // FALSE = closed
      visibilityToggle: true,
      invertVisibility: true, // Show when closed
      inactiveState: { rotation: [0, 0, 0], position: [0, 0, 0] },
      activeState: { rotation: [0, 0, 0], position: [0, 0, 0] },
      animationDuration: 300,
    },
    // Right door - open mesh
    {
      nodeName: 'Door_Right_m_cabinet_0',
      materialName: 'm_cabinet',
      displayName: 'Right Door',
      stateKey: 'rightDoor',
      group: 'doors',
      defaultState: false, // FALSE = closed
      visibilityToggle: true,
      invertVisibility: false, // Show when open
      inactiveState: { rotation: [0, 0, 0], position: [0, 0, 0] },
      activeState: { rotation: [0, 0, 0], position: [0, 0, 0] },
      animationDuration: 300,
    },
  ],

  // Scale down the model to fit in the viewport (cabinet is very large)
  scale: 0.012,

  // Position the cabinet so its back edge touches the wall
  // Wall is at Z = -3, so position model further back so back edge touches wall
  // Model depth is ~45cm, scaled at 0.012 = ~0.54 units, so move center to -2.73
  position: [0, -1.335, -2.73],

  camera: {
    position: [-5, 0, 11], // Base camera position
    fov: 17,
  },

  animations: {
    enableRotation: false, // Disabled - no rotation for cabinet
    enableBobbing: false, // Disabled - cabinets don't float
  },

  // Dimension constraints for cabinet (typical bar cabinet sizes)
  dimensions: {
    width: {
      min: 80, // Minimum 80cm wide
      max: 180, // Maximum 180cm wide
      default: 120, // Default 120cm (standard size)
      step: 10, // Adjust in 10cm increments
    },
    height: {
      min: 100, // Minimum 100cm tall
      max: 200, // Maximum 200cm tall
      default: 150, // Default 150cm (standard height)
      step: 10, // Adjust in 10cm increments
    },
    depth: {
      min: 35, // Minimum 35cm deep
      max: 60, // Maximum 60cm deep
      default: 45, // Default 45cm (standard depth)
      step: 5, // Adjust in 5cm increments
    },
  },

  metadata: {
    description:
      'Bar cabinet with customizable wood finish and adjustable dimensions',
    tags: ['furniture', 'cabinet', 'storage'],
    version: '1.0.0',
  },
};
