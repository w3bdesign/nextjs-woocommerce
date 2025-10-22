# Room Presets Guide - 3D Canvas Configuration

## Overview

The Canvas3D component now supports **room presets** that define the complete visual environment for your 3D furniture models. Each preset includes floor/wall colors, lighting configuration, and environment settings to create professional product showcase scenes.

## Available Room Presets

### 1. **Modern Studio** (Default)

The aspirational preset matching the screenshot you provided:

- **Floor Color**: Warm beige (`#e0ddd8`)
- **Wall Color**: Light gray (`#e8e8e8`)
- **Lighting**: Balanced, professional product photography lighting
- **Environment**: None (no environment map reflections)
- **Best For**: Clean, minimalist furniture products (cabinets, couches, etc.)

```tsx
<Canvas3D roomPreset="modern-studio">
  <ModelViewer modelConfig={modelConfig} />
</Canvas3D>
```

### 2. **Bright Minimal**

Bright, airy, and welcoming appearance:

- **Floor Color**: Off-white (`#f5f5f5`)
- **Wall Color**: Bright white (`#fafafa`)
- **Lighting**: More intense ambient light for a very bright space
- **Environment**: Apartment preset (subtle reflections)
- **Best For**: High-end, luxury furniture pieces

### 3. **Warm Ambient**

Cozy, inviting retail environment:

- **Floor Color**: Warm beige (`#d4c9c1`)
- **Wall Color**: Soft cream (`#ede8e3`)
- **Lighting**: Warm, directional lighting
- **Environment**: Warehouse preset (natural light feel)
- **Best For**: Home furniture, warm color products

### 4. **Professional**

Corporate showroom aesthetic:

- **Floor Color**: Medium gray (`#cccccc`)
- **Wall Color**: Light gray (`#e0e0e0`)
- **Lighting**: Balanced, controlled professional lighting
- **Environment**: City preset (realistic urban reflections)
- **Best For**: Commercial furniture, office setups

## How to Use

### Basic Usage (Default Preset)

```tsx
<Canvas3D shadowConfig={modelConfig.shadow} cameraConfig={modelConfig.camera}>
  <ModelViewer modelConfig={modelConfig} />
</Canvas3D>
```

### Specify a Different Preset

```tsx
<Canvas3D
  shadowConfig={modelConfig.shadow}
  cameraConfig={modelConfig.camera}
  roomPreset="warm-ambient"
>
  <ModelViewer modelConfig={modelConfig} />
</Canvas3D>
```

## Scene Elements

Each room preset configures:

### Floor Plane

- Large plane beneath the model
- Receives shadows for realistic depth
- Material properties configured per preset

### Back Wall

- **NEW**: Vertical plane positioned behind the furniture
- Creates visual context and prevents floating appearance
- Positioned at -3 to -3.5 units behind the center
- Receives shadows from the 3D model

### Lighting

- **Ambient Light**: Fills the entire scene
- **Main Directional Light**: Primary light source with shadows
- **Secondary Directional Light**: Fill light to reduce harsh shadows
- **Spot Light**: Additional accent light

### Environment

Some presets include environment maps for realistic reflections. Set to `'none'` for complete control via manual lighting.

## Customization

To create a custom room preset, add it to `ROOM_PRESETS` in `Canvas3D.component.tsx`:

```typescript
const ROOM_PRESETS: Record<string, RoomConfig> = {
  'my-custom-preset': {
    id: 'my-custom-preset',
    name: 'My Custom Room',
    floorColor: '#yourcolor',
    wallColor: '#yourcolor',
    ambientLightIntensity: 2.8,
    directionalLightIntensity: 5.5,
    directionalLightPosition: [2, 6, 2],
    secondaryLightIntensity: 0.8,
    secondaryLightPosition: [-5, 3, -5],
    environmentPreset: 'apartment',
    wallDepth: -3,
    floorRoughness: 0.8,
    wallRoughness: 0.9,
  },
  // ... other presets
};
```

### RoomConfig Properties

| Property                    | Type      | Description                                                |
| --------------------------- | --------- | ---------------------------------------------------------- |
| `id`                        | string    | Unique identifier for the preset                           |
| `name`                      | string    | Display name                                               |
| `floorColor`                | string    | Hex or CSS color for floor                                 |
| `wallColor`                 | string    | Hex or CSS color for back wall                             |
| `ambientLightIntensity`     | number    | 0-3, fills entire scene                                    |
| `directionalLightIntensity` | number    | 0-10, main light intensity                                 |
| `directionalLightPosition`  | [x, y, z] | Position of main light                                     |
| `secondaryLightIntensity`   | number    | 0-5, fill light intensity                                  |
| `secondaryLightPosition`    | [x, y, z] | Position of fill light                                     |
| `environmentPreset`         | enum      | `'apartment'`, `'city'`, `'warehouse'`, `'park'`, `'none'` |
| `wallDepth`                 | number    | Optional: Z position of back wall (default -3)             |
| `floorRoughness`            | number    | Material roughness 0-1                                     |
| `wallRoughness`             | number    | Material roughness 0-1                                     |

## Tips for Best Results

1. **Match Your Brand**: Create a preset that reflects your furniture store's aesthetic
2. **Test Different Presets**: Each preset creates a different mood; find what works best for your products
3. **Adjust Lighting**: The main directional light position affects shadow direction and model visibility
4. **Wall Depth**: Adjust `wallDepth` to move the wall closer/further from the model (useful for different model sizes)
5. **Material Roughness**: Lower values create more reflective surfaces; higher values are more matte

## Example: Using Modern Studio (Recommended Default)

```tsx
// In ProductConfigurator.component.tsx
<Canvas3D
  shadowConfig={modelConfig.shadow}
  cameraConfig={modelConfig.camera}
  roomPreset="modern-studio" // ← New parameter
>
  <ModelViewer modelConfig={modelConfig} />
</Canvas3D>
```

This will display your furniture model with:

- Realistic floor shadows
- Neutral background wall
- Professional product photography lighting
- Perfect for e-commerce furniture showcase

---

**Note**: The back wall is now a permanent feature of the scene. It receives shadows and creates proper spatial context for your 3D models, matching professional furniture retail configurators.
