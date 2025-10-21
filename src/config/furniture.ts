/**
 * Furniture Store Design System Configuration
 * 
 * Centralized design tokens for furniture e-commerce brand
 * Extracted from button variants, typography system, and theme colors
 */

/**
 * Brand Colors - Furniture Store Theme
 * Warm neutrals with accent colors for sales and promotions
 */
export const furnitureColors = {
  // Primary palette (neutral grays)
  neutral: {
    50: '#FAFAFA',   // Lightest gray - backgrounds
    100: '#F5F5F5',  // Light gray - hover states
    200: '#E5E5E5',  // Border gray
    300: '#D4D4D4',  // Divider gray
    400: '#A3A3A3',  // Muted text
    500: '#737373',  // Secondary text
    600: '#525252',  // Body text
    700: '#404040',  // Dark text
    800: '#262626',  // Headings
    900: '#171717',  // Black
  },
  
  // Accent colors
  accent: {
    sale: '#E11D48',      // Rose-600 - sale prices
    success: '#16A34A',   // Green-600 - in stock, success states
    warning: '#F59E0B',   // Amber-500 - low stock warnings
    info: '#2563EB',      // Blue-600 - informational
  },
  
  // Material colors for product visualization
  materials: {
    woodLight: '#F59E0B',   // Light wood tones
    woodDark: '#EA580C',    // Dark wood tones
    fabricBeige: '#FAF8F5', // Fabric beige
    metalSilver: '#94A3B8', // Metal silver
    metalGold: '#F59E0B',   // Metal gold
  },
  
  // Interactive states
  states: {
    hover: 'rgba(0, 0, 0, 0.05)',
    active: 'rgba(0, 0, 0, 0.1)',
    disabled: 'rgba(0, 0, 0, 0.3)',
    focus: '#2563EB',
  },
} as const;

/**
 * Typography System
 * Font sizes, weights, and line heights for consistent typography
 */
export const furnitureTypography = {
  // Font families
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['Fira Code', 'Consolas', 'Monaco', 'monospace'],
  },
  
  // Font sizes with rem values
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },
  
  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights for readability
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
  
  // Letter spacing (tracking)
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

/**
 * Spacing System
 * Consistent spacing scale using 4px base unit
 */
export const furnitureSpacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
} as const;

/**
 * Border Radius
 * Rounded corners for furniture store aesthetic
 */
export const furnitureBorderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  default: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',   // Fully rounded
} as const;

/**
 * Shadows
 * Subtle elevation for cards and interactive elements
 */
export const furnitureShadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
} as const;

/**
 * Transitions
 * Animation durations and easing functions
 */
export const furnitureTransitions = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * Breakpoints
 * Responsive design breakpoints
 */
export const furnitureBreakpoints = {
  xs: '375px',   // Mobile small
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
} as const;

/**
 * Container Widths
 * Max widths for content containers
 */
export const furnitureContainerWidths = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  full: '100%',
} as const;

/**
 * Z-Index Scale
 * Layering system for overlays, modals, etc.
 */
export const furnitureZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

/**
 * Button Presets
 * Extracted from button.tsx variants
 */
export const furnitureButtonPresets = {
  hero: {
    padding: '1rem 2rem',
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
    background: '#FFFFFF',
    color: '#171717',
    hoverBackground: '#A3A3A3',
    hoverColor: '#FFFFFF',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  filter: {
    padding: '0.25rem 0.75rem',
    border: '1px solid #E5E5E5',
    borderRadius: '0.25rem',
    background: '#FFFFFF',
    color: '#171717',
    hoverBackground: '#F5F5F5',
    selectedBackground: '#171717',
    selectedColor: '#FFFFFF',
  },
  
  reset: {
    padding: '0.5rem 1rem',
    background: '#F5F5F5',
    color: '#404040',
    borderRadius: '0.25rem',
    hoverBackground: '#E5E5E5',
  },
} as const;

/**
 * Card Presets
 * Common card configurations
 */
export const furnitureCardPresets = {
  product: {
    borderRadius: furnitureBorderRadius.lg,
    padding: furnitureSpacing[6],
    shadow: furnitureShadows.default,
    hoverShadow: furnitureShadows.lg,
    transition: `box-shadow ${furnitureTransitions.duration.normal} ${furnitureTransitions.easing.default}`,
  },
  
  category: {
    borderRadius: furnitureBorderRadius.md,
    padding: furnitureSpacing[6],
    shadow: furnitureShadows.sm,
    hoverShadow: furnitureShadows.md,
    transition: `box-shadow ${furnitureTransitions.duration.normal} ${furnitureTransitions.easing.default}`,
  },
} as const;

/**
 * Complete Furniture Design System Export
 */
export const furnitureDesignSystem = {
  colors: furnitureColors,
  typography: furnitureTypography,
  spacing: furnitureSpacing,
  borderRadius: furnitureBorderRadius,
  shadows: furnitureShadows,
  transitions: furnitureTransitions,
  breakpoints: furnitureBreakpoints,
  containerWidths: furnitureContainerWidths,
  zIndex: furnitureZIndex,
  buttonPresets: furnitureButtonPresets,
  cardPresets: furnitureCardPresets,
} as const;

// Type exports for TypeScript autocomplete
export type FurnitureColors = typeof furnitureColors;
export type FurnitureTypography = typeof furnitureTypography;
export type FurnitureSpacing = typeof furnitureSpacing;
export type FurnitureBorderRadius = typeof furnitureBorderRadius;
export type FurnitureShadows = typeof furnitureShadows;
export type FurnitureTransitions = typeof furnitureTransitions;
export type FurnitureBreakpoints = typeof furnitureBreakpoints;
export type FurnitureDesignSystem = typeof furnitureDesignSystem;
