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
 * Shadow configuration for the ground plane
 */
export interface ShadowConfig {
  /** Y position of the shadow plane (default: -0.8) */
  position?: number;
  /** Opacity of the shadow (0-1, default: 0.25) */
  opacity?: number;
  /** Scale/size of the shadow (default: 10) */
  scale?: number;
  /** Blur amount (default: 1.5) */
  blur?: number;
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
  
  /** Optional: Shadow configuration for ground plane */
  shadow?: ShadowConfig;
  
  /** Optional: Scale factor for the model (default: 1) */
  scale?: number;
  
  /** Optional: Position offset [x, y, z] for the model (default: [0, 0, 0]) */
  position?: [number, number, number];
  
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
