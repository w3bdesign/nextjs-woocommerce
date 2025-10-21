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
    {
      nodeName: 'Door_Closed_Left_m_cabinet_0',
      materialName: 'm_cabinet',
      displayName: 'Left Door',
      defaultColor: '#8B4513', // Matching wood color
    },
    {
      nodeName: 'Door_Closed_Right_m_cabinet_0',
      materialName: 'm_cabinet',
      displayName: 'Right Door',
      defaultColor: '#8B4513', // Matching wood color
    },
    // Note: Open door states (Door_Left_m_cabinet_0, Door_Right_m_cabinet_0)
    // are not included as the configurator would need visibility toggle functionality
    // to properly show/hide them. For now, we're showing closed doors only.
  ],
  
  // Scale down the model to fit in the viewport (cabinet is very large)
  scale: 0.012,
  
  // Position the cabinet so it sits on the ground plane (adjusted for model's internal offset)
  position: [0, -1.0, 0],
  
  camera: {
    position: [0, 0.5, 10], // Camera angle for viewing cabinet on ground
    fov: 50,
  },
  
  animations: {
    enableRotation: false, // Disabled - no rotation for cabinet
    enableBobbing: false,  // Disabled - cabinets don't float
  },
  
  shadow: {
    position: -1.0, // Ground plane position (where cabinet base should be)
    opacity: 0.5,   // More visible shadow
    scale: 8,       // Shadow size
    blur: 2.5,      // Soft shadow edges
  },
  
  metadata: {
    description: 'Bar cabinet with customizable wood finish',
    tags: ['furniture', 'cabinet', 'storage'],
    version: '1.0.0',
  },
};
