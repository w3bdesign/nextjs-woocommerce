import type { ModelConfig } from '@/types/configurator';

/**
 * Shoe Model Configuration
 * 
 * This configuration defines the customizable parts of the shoe model
 * used in the product configurator POC.
 * 
 * Model: shoe-draco.glb
 * Parts: 8 customizable materials
 */
export const SHOE_CONFIG: ModelConfig = {
  id: 'shoe-v1',
  name: 'Customizable Shoe',
  modelPath: '/shoe-draco.glb',
  
  parts: [
    {
      nodeName: 'shoe',
      materialName: 'laces',
      displayName: 'Laces',
      defaultColor: '#ffffff',
    },
    {
      nodeName: 'shoe_1',
      materialName: 'mesh',
      displayName: 'Mesh',
      defaultColor: '#ffffff',
    },
    {
      nodeName: 'shoe_2',
      materialName: 'caps',
      displayName: 'Caps',
      defaultColor: '#ffffff',
    },
    {
      nodeName: 'shoe_3',
      materialName: 'inner',
      displayName: 'Inner',
      defaultColor: '#ffffff',
    },
    {
      nodeName: 'shoe_4',
      materialName: 'sole',
      displayName: 'Sole',
      defaultColor: '#ffffff',
    },
    {
      nodeName: 'shoe_5',
      materialName: 'stripes',
      displayName: 'Stripes',
      defaultColor: '#ffffff',
    },
    {
      nodeName: 'shoe_6',
      materialName: 'band',
      displayName: 'Band',
      defaultColor: '#ffffff',
    },
    {
      nodeName: 'shoe_7',
      materialName: 'patch',
      displayName: 'Patch',
      defaultColor: '#ffffff',
    },
  ],
  
  animations: {
    enableRotation: true,
    enableBobbing: true,
    rotationSpeed: 1,
    bobbingAmplitude: 0.1,
  },
  
  metadata: {
    description: 'Demo shoe model with 8 customizable parts',
    tags: ['footwear', 'demo', 'poc'],
    version: '1.0.0',
  },
};
