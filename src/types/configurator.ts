/**
 * Configurator Type Definitions
 * 
 * These types define the structure for configurable 3D models,
 * enabling support for multiple different models and products.
 */

/**
 * Camera configuration for the 3D scene
 */
export interface CameraConfig {
  position: [number, number, number];
  fov: number;
}

/**
 * Animation configuration for model display
 */
export interface AnimationConfig {
  enableRotation?: boolean;
  enableBobbing?: boolean;
  rotationSpeed?: number;
  bobbingAmplitude?: number;
}

/**
 * Defines a customizable part of a 3D model
 */
export interface ModelPart {
  /** The node name in the GLTF/GLB file (e.g., "shoe", "shoe_1") */
  nodeName: string;
  
  /** The material identifier used for color/texture application */
  materialName: string;
  
  /** User-friendly display name shown in the UI */
  displayName: string;
  
  /** Default hex color for this part */
  defaultColor: string;
  
  /** Optional: Restrict available colors to a predefined palette */
  allowedColors?: string[];
  
  /** Optional: Type of customization (for future extensibility) */
  type?: 'color' | 'texture' | 'material';
}

/**
 * Complete configuration for a 3D model
 */
export interface ModelConfig {
  /** Unique identifier for this model configuration */
  id: string;
  
  /** Display name for the model */
  name: string;
  
  /** Path to the GLTF/GLB file in the public directory */
  modelPath: string;
  
  /** Array of customizable parts */
  parts: ModelPart[];
  
  /** Optional: Custom camera configuration */
  camera?: CameraConfig;
  
  /** Optional: Animation settings */
  animations?: AnimationConfig;
  
  /** Optional: Additional metadata */
  metadata?: {
    description?: string;
    tags?: string[];
    version?: string;
  };
}

/**
 * Product configurator metadata
 * To be added to the Product type for associating models with products
 */
export interface ProductConfiguratorMetadata {
  /** Whether the configurator is enabled for this product */
  enabled: boolean;
  
  /** Reference to the ModelConfig ID to use */
  modelId: string;
  
  /** Optional: Custom pricing rules based on configuration */
  customPricing?: Record<string, number>;
  
  /** Optional: Default configuration to start with */
  defaultConfiguration?: Record<string, string>;
}
