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
  /** Near clipping plane distance (default: 0.1) */
  near?: number;
  /** Far clipping plane distance (default: 1000) */
  far?: number;
}

/**
 * Scene boundary configuration
 * Defines spatial limits for camera movement and model positioning
 */
export interface SceneBoundaries {
  /**
   * Back wall Z position in world units
   * Negative values indicate distance away from camera
   * @example -3 // Wall is 3 units behind the origin
   */
  wallZPosition: number;

  /**
   * Safety margin to keep camera in front of wall (world units)
   * Camera's minimum Z position = wallZPosition + cameraSafetyMargin
   * @example 0.5 // Camera stays at least 0.5 units from wall
   */
  cameraSafetyMargin: number;

  /**
   * Floor Y position in world units (optional, for future use)
   * @default 0
   */
  floorYPosition?: number;
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
 * Room configuration for 3D scene environment
 * Defines the background, lighting, and spatial context
 */
export interface RoomConfig {
  /** Unique identifier for this room preset */
  id: string;

  /** Display name for the room preset */
  name: string;

  /** Floor color (hex or CSS color) */
  floorColor: string;

  /** Back wall color (hex or CSS color) */
  wallColor: string;

  /** Ambient light intensity (0-3) */
  ambientLightIntensity: number;

  /** Main directional light intensity (0-10) */
  directionalLightIntensity: number;

  /** Position of main directional light */
  directionalLightPosition: [number, number, number];

  /** Secondary light intensity (0-5) */
  secondaryLightIntensity: number;

  /** Secondary light position */
  secondaryLightPosition: [number, number, number];

  /** Environment preset from drei (or 'none' to disable) */
  environmentPreset: 'apartment' | 'city' | 'park' | 'warehouse' | 'none';

  /** Wall Z position (distance from center) */
  wallDepth?: number;

  /** Floor material roughness */
  floorRoughness?: number;

  /** Wall material roughness */
  wallRoughness?: number;
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
  /** Optional shadow map size for directional lights (e.g., 1024/2048) */
  mapSize?: number;
  /** Optional shadow bias to reduce acne (e.g., -0.0001) */
  bias?: number;
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
 * Defines an interactive part that can be toggled (e.g., doors, drawers)
 * Simplified to visibility-only toggling - no complex animations
 */
export interface InteractivePart {
  /** The node name in the GLTF/GLB file */
  nodeName: string;

  /** The material identifier (for consistent identification) */
  materialName: string;

  /** User-friendly display name shown in the UI */
  displayName: string;

  /** Group/category for the interactive part (e.g., "doors") */
  group?: string;

  /** State key to use (defaults to nodeName). Share key between parts to link them */
  stateKey?: string;

  /** Default state (true = active/open, false = inactive/closed) */
  defaultState: boolean;

  /**
   * Whether this part should be visible when state is ACTIVE (true)
   * - true = show when open/active
   * - false = show when closed/inactive
   */
  visibleWhenActive: boolean;
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

  /** Optional: Interactive parts that can be toggled (doors, drawers, etc.) */
  interactiveParts?: InteractivePart[];

  /** Optional: Shadow configuration for ground plane */
  shadow?: ShadowConfig;

  /** Optional: Scale factor for the model (default: 1) */
  scale?: number;

  /** Optional: Position offset [x, y, z] for the model (default: [0, 0, 0]) */
  position?: [number, number, number];
  /** Optional: Euler rotation (radians) to apply to the model [x, y, z] */
  rotation?: [number, number, number];

  /** Optional: Dimension constraints for scaling */
  dimensions?: {
    /** Length (Z axis - depth/front-to-back) constraints in cm */
    length: {
      min: number;
      max: number;
      default: number;
      step: number;
    };
    /** Width (X axis - side-to-side) constraints in cm */
    width: {
      min: number;
      max: number;
      default: number;
      step: number;
    };
    /** Height (Y axis - vertical) constraints in cm */
    height: {
      min: number;
      max: number;
      default: number;
      step: number;
    };
  };

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
