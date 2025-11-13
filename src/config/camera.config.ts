/**
 * Camera System Configuration
 *
 * Centralized constants for camera behavior, animations, and presets.
 * All magic numbers are documented with their purpose.
 */

/**
 * Animation configuration for smooth camera transitions
 */
export const CAMERA_ANIMATION = {
  /**
   * Speed multiplier for lerp-based animation (higher = faster)
   * Value of 5 provides smooth transitions without feeling sluggish
   */
  LERP_SPEED: 5,

  /**
   * Distance threshold (in world units) for considering animation complete
   * Small value ensures accurate final positioning
   */
  COMPLETION_THRESHOLD: 0.001,
} as const;

/**
 * Snap-back behavior configuration
 * Controls when and how camera returns to nearest preset after user interaction
 */
export const CAMERA_SNAP_BACK = {
  /**
   * Delay (ms) after user stops controlling before snap-back triggers
   * 500ms feels natural - long enough to avoid jarring snaps, short enough to feel responsive
   */
  DELAY_MS: 500,

  /**
   * Debounce delay (ms) for mediator updates
   * Prevents excessive recalculations during rapid model changes
   */
  MEDIATOR_DEBOUNCE_MS: 250,

  /**
   * Threshold for center shift detection (relative, 0-1)
   * 0.05 = 5% change in center position required before triggering snap
   * Prevents unnecessary snaps from minor adjustments
   */
  CENTER_SHIFT_THRESHOLD: 0.05,

  /**
   * Threshold for size change detection (relative, 0-1)
   * 0.05 = 5% change in model size required before triggering snap
   * Prevents unnecessary snaps from minor dimension adjustments
   */
  SIZE_CHANGE_THRESHOLD: 0.05,
} as const;

/**
 * Camera preset angles for three-quarter views
 * Using pi-based values for precise angular positioning
 */
export const CAMERA_PRESET_ANGLES = {
  /**
   * Horizontal angle offset for left/right presets
   * 0.17π ≈ 30.6° - creates pleasing three-quarter view
   * Not too extreme (45°) but enough to show depth
   */
  THETA: 0.17,

  /**
   * Vertical angle from top (pole)
   * 0.47π ≈ 84.6° from vertical - slightly elevated view
   * Shows top surface while maintaining good perspective
   */
  PHI: 0.47,

  /**
   * Vertical bias for target point (relative to model height)
   * 0.05 = 5% above center - frames furniture nicely
   * Prevents cutting off top details
   */
  VERTICAL_BIAS: 0.05,
} as const;

/**
 * Camera zoom and distance constraints
 */
export const CAMERA_ZOOM = {
  /**
   * Minimum zoom multiplier (relative to base distance)
   * 0.35 = can zoom in to 35% of base distance
   * Prevents getting too close to see details without clipping
   */
  MIN_DISTANCE_MULTIPLIER: 0.35,

  /**
   * Minimum absolute distance (world units) - hard limit
   * Prevents camera from going inside model geometry
   */
  MIN_ABSOLUTE_DISTANCE: 0.8,

  /**
   * Maximum zoom multiplier (relative to base distance)
   * 1.5 = can zoom out to 150% of base distance
   * Provides context view without losing detail
   */
  MAX_DISTANCE_MULTIPLIER: 1.5,

  /**
   * Safety factor for automatic distance calculations
   * 1.1 = 10% extra space around model
   * Ensures model fits comfortably in viewport
   */
  SAFETY_FACTOR: 1.1,
} as const;

/**
 * Camera rotation constraints (in radians)
 */
export const CAMERA_ROTATION = {
  /**
   * Minimum polar angle (vertical)
   * 0 = can look from directly above
   * Full freedom for top-down views
   */
  MIN_POLAR_ANGLE: 0,

  /**
   * Maximum polar angle (vertical)
   * π/2 = can look horizontally, but not from below
   * Prevents confusing upside-down views
   */
  MAX_POLAR_ANGLE: Math.PI / 2,

  /**
   * Azimuthal angle constraints (horizontal)
   * -Infinity to +Infinity = full 360° rotation
   * No horizontal constraints for maximum freedom
   */
  MIN_AZIMUTH_ANGLE: -Infinity,
  MAX_AZIMUTH_ANGLE: Infinity,
} as const;

/**
 * OrbitControls interaction settings
 */
export const CAMERA_CONTROLS = {
  /**
   * Zoom speed multiplier
   * 0.8 = slightly slower than default for more precise control
   */
  ZOOM_SPEED: 0.8,

  /**
   * Rotation speed multiplier
   * 1.0 = default speed, feels natural and responsive
   */
  ROTATE_SPEED: 1.0,

  /**
   * Enable damping (smooth deceleration)
   * false = immediate response, better for snap-back system
   * Damping conflicts with our custom animation system
   */
  ENABLE_DAMPING: false,

  /**
   * Enable panning (camera translation)
   * false = object stays centered, simpler UX
   * Panning can be confusing for product viewers
   */
  ENABLE_PAN: false,
} as const;

/**
 * Combined configuration export for convenience
 */
export const CAMERA_CONFIG = {
  animation: CAMERA_ANIMATION,
  snapBack: CAMERA_SNAP_BACK,
  angles: CAMERA_PRESET_ANGLES,
  zoom: CAMERA_ZOOM,
  rotation: CAMERA_ROTATION,
  controls: CAMERA_CONTROLS,
} as const;

export default CAMERA_CONFIG;
