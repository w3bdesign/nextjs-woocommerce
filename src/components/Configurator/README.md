# 3D Product Configurator

> **Status:** Production-Ready | Generic & Extensible  
> **Version:** 2.0 (Refactored October 2025)

A flexible, configuration-driven 3D product customization system for Next.js/WooCommerce applications. Allows customers to customize product colors in real-time using interactive 3D models.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Adding New Models](#adding-new-models)
- [Configuration](#configuration)
- [Component API](#component-api)
- [Testing](#testing)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)

---

## Overview

### What It Does

- **Real-time 3D Visualization**: Interactive WebGL-based product previews
- **Color Customization**: Click parts to customize colors with a hex color picker
- **Multiple Model Support**: Generic system supports any 3D model via configuration
- **Product Integration**: Seamlessly integrates with WooCommerce product data
- **SSR-Safe**: Dynamic imports prevent server-side rendering issues
- **Mobile-Friendly**: Responsive design with touch support

### Technology Stack

| Library | Purpose |
|---------|---------|
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Helper utilities and components |
| `three` | WebGL 3D rendering engine |
| `valtio` | Proxy-based state management |
| `react-colorful` | Color picker component |

---

## Features

### ✅ Current Features

- ✅ Real-time 3D model rendering with WebGL
- ✅ Interactive part selection (click on model)
- ✅ Color customization with hex color picker
- ✅ Smooth animations (rotation, bobbing)
- ✅ Responsive design (desktop & mobile)
- ✅ SSR-safe implementation
- ✅ Multiple model support via registry
- ✅ Per-product configurator control
- ✅ TypeScript type safety
- ✅ Dynamic part rendering from config

### 🔜 Potential Future Features

- [ ] Cart integration (save configuration)
- [ ] Preset color schemes
- [ ] Texture/material selection
- [ ] AR viewing on mobile
- [ ] Custom pricing based on selections
- [ ] Screenshot/share functionality
- [ ] Multi-product configurator (sets)

---

## Architecture

### Component Structure

```
ProductConfigurator (Entry Point)
├── Canvas3D (3D Scene Setup)
│   ├── Lighting
│   ├── Camera Controls
│   └── ModelViewer (Model Rendering)
│       └── Dynamic Mesh Rendering
└── ColorPicker (UI Overlay)
```

### Data Flow

```
Product Data (with configurator metadata)
    ↓
ProductConfigurator (loads model by ID)
    ↓
MODEL_REGISTRY (fetches config)
    ↓
configuratorStore (initializes state)
    ↓
ModelViewer (renders from config)
    ↓
User Interaction → State Update → UI Update
```

### Files & Responsibilities

#### Components (`src/components/Configurator/`)

| File | Purpose |
|------|---------|
| `ProductConfigurator.component.tsx` | Main orchestrator, handles model loading |
| `Canvas3D.component.tsx` | 3D scene setup (lighting, camera, controls) |
| `ModelViewer.component.tsx` | Renders 3D model from configuration |
| `ColorPicker.component.tsx` | Color customization UI overlay |

#### Configuration (`src/config/`)

| File | Purpose |
|------|---------|
| `models.registry.ts` | Central registry of all available models |
| `shoeModel.config.ts` | Example: Shoe model configuration |
| `[yourModel].config.ts` | Your custom model configs |

#### State Management (`src/stores/`)

| File | Purpose |
|------|---------|
| `configuratorStore.ts` | Valtio store for configurator state |

#### Types (`src/types/`)

| File | Purpose |
|------|---------|
| `configurator.ts` | TypeScript interfaces for configs |

---

## Quick Start

### 1. View Existing Implementation

The configurator is ready to use. To see it in action:

```bash
npm run dev
```

Navigate to: `http://localhost:3000/product/mock-tee`

### 2. Enable for Your Products

Add configurator metadata to your product data:

```typescript
// In your product data (WooCommerce/GraphQL)
{
  name: "Custom Shoe",
  // ... other product fields
  configurator: {
    enabled: true,
    modelId: 'shoe-v1'  // Must exist in MODEL_REGISTRY
  }
}
```

### 3. Component Usage

```tsx
// Automatic (reads from product data)
<ProductConfigurator />

// Manual (specify model)
<ProductConfigurator modelId="shoe-v1" />
```

---

## Adding New Models

### Step-by-Step Guide

#### 1. Prepare Your 3D Model

**Requirements:**
- Format: GLTF/GLB
- Compression: Draco (recommended)
- Size: < 5MB (recommended)
- Polygon count: < 50k triangles

**Optimization:**
```bash
# Using gltf-pipeline
gltf-pipeline -i model.glb -o model-draco.glb -d
```

**Find node/material names:**
- Open GLB in [glTF Viewer](https://gltf-viewer.donmccurdy.com/)
- Note mesh names (nodes) and material names

#### 2. Create Model Configuration

Create `src/config/[modelName]Model.config.ts`:

```typescript
import type { ModelConfig } from '@/types/configurator';

export const SOFA_CONFIG: ModelConfig = {
  // Unique identifier
  id: 'sofa-modern-v1',
  
  // Display name
  name: 'Modern Sofa',
  
  // Path to GLB file (in /public/)
  modelPath: '/models/sofa-modern.glb',
  
  // Customizable parts
  parts: [
    {
      nodeName: 'sofa_cushions',      // From GLTF file
      materialName: 'fabric',          // From GLTF file
      displayName: 'Cushion Fabric',   // User-friendly
      defaultColor: '#e0e0e0',         // Hex color
    },
    {
      nodeName: 'sofa_legs',
      materialName: 'wood',
      displayName: 'Wooden Legs',
      defaultColor: '#8b4513',
    },
    // ... more parts
  ],
  
  // Optional: Custom animations
  animations: {
    enableRotation: true,
    enableBobbing: false,
  },
  
  // Optional: Metadata
  metadata: {
    description: 'Modern sofa with customizable fabric',
    tags: ['furniture', 'sofa'],
    version: '1.0.0',
  },
};
```

#### 3. Register Model

Edit `src/config/models.registry.ts`:

```typescript
import { SOFA_CONFIG } from './sofaModel.config';

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  'shoe-v1': SHOE_CONFIG,
  'sofa-modern-v1': SOFA_CONFIG,  // Add your model
};
```

#### 4. Associate with Product

```typescript
// In product data
product: {
  name: "Modern Sofa",
  configurator: {
    enabled: true,
    modelId: 'sofa-modern-v1'  // Your model ID
  }
}
```

#### 5. Test

```bash
npm run build  # Should succeed
npm run dev    # Test in browser
```

**That's it!** No component code changes needed. ✅

---

## Configuration

### ModelConfig Interface

```typescript
interface ModelConfig {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  modelPath: string;             // Path to GLB file
  parts: ModelPart[];            // Customizable parts
  camera?: CameraConfig;         // Optional camera settings
  animations?: AnimationConfig;  // Optional animation settings
  metadata?: {                   // Optional metadata
    description?: string;
    tags?: string[];
    version?: string;
  };
}
```

### ModelPart Interface

```typescript
interface ModelPart {
  nodeName: string;        // Node name in GLTF file
  materialName: string;    // Material identifier
  displayName: string;     // User-friendly name
  defaultColor: string;    // Default hex color
  allowedColors?: string[]; // Optional: restrict colors
  type?: 'color' | 'texture' | 'material';
}
```

### Configuration Options

#### Basic Configuration
```typescript
{
  id: 'product-v1',
  name: 'Product Name',
  modelPath: '/models/product.glb',
  parts: [/* ... */]
}
```

#### With Color Restrictions
```typescript
parts: [
  {
    nodeName: 'body',
    materialName: 'paint',
    displayName: 'Body Color',
    defaultColor: '#ffffff',
    allowedColors: ['#ff0000', '#00ff00', '#0000ff'] // Only these
  }
]
```

#### With Custom Camera
```typescript
camera: {
  position: [0, 2, 5],  // [x, y, z]
  fov: 50               // Field of view
}
```

#### With Custom Animations
```typescript
animations: {
  enableRotation: true,
  enableBobbing: false,
  rotationSpeed: 0.5,    // Slower
  bobbingAmplitude: 0.2  // More movement
}
```

---

## Component API

### ProductConfigurator

Main entry component for the configurator.

#### Props

```typescript
interface ProductConfiguratorProps {
  modelId?: string;    // Model ID from registry (default: 'shoe-v1')
  className?: string;  // Additional CSS classes
}
```

#### Usage

```tsx
// Default model
<ProductConfigurator />

// Specific model
<ProductConfigurator modelId="sofa-modern-v1" />

// With styling
<ProductConfigurator 
  modelId="chair-v1" 
  className="my-custom-class"
/>
```

### ModelViewer

Renders the 3D model (usually used internally).

#### Props

```typescript
interface ModelViewerProps {
  modelPath?: string;      // Override model path
  modelConfig?: ModelConfig; // Model configuration
}
```

### Canvas3D

3D scene wrapper (usually used internally).

#### Props

```typescript
interface Canvas3DProps {
  children: ReactElement;  // Model viewer component
}
```

---

## Testing

### Manual Testing Checklist

After adding a new model, verify:

- [ ] **Build succeeds**: `npm run build`
- [ ] **Model renders**: Visible in browser
- [ ] **All parts visible**: No missing meshes
- [ ] **Parts clickable**: Can select each part
- [ ] **Color picker works**: Appears on click
- [ ] **Colors update**: Changes apply in real-time
- [ ] **Animations work**: Rotation/bobbing functional
- [ ] **No console errors**: Check browser console
- [ ] **Mobile responsive**: Test on mobile device
- [ ] **Performance**: Smooth 60fps on target devices

### Testing with Mock Products

The "Mock Tee" product has the configurator enabled for testing:

```bash
npm run dev
# Visit: http://localhost:3000/product/mock-tee
```

To enable for other mock products, edit `src/utils/apollo/mockData.ts`:

```typescript
{
  name: 'Mock Hoodie',
  // ... fields
  configurator: {
    enabled: true,
    modelId: 'shoe-v1'
  }
}
```

### Automated Testing

```bash
# Type check
npm run type-check  # (if available)

# Build test
npm run build

# Lint
npm run lint
```

---

## Performance

### Current Metrics

| Metric | Value | Status |
|--------|-------|--------|
| Bundle Size Impact | ~500KB | ✅ Acceptable |
| Initial Load | No impact | ✅ Dynamic import |
| Product Page Load | +1-2s | ✅ Lazy loaded |
| Model File Size | ~1-2MB | ✅ Draco compressed |
| Runtime FPS | 60fps | ✅ Smooth |

### Optimization Best Practices

1. **Model Optimization**
   - Use Draco compression
   - Keep under 5MB
   - Reduce polygon count (<50k)
   - Optimize textures (compress, reduce resolution)

2. **Loading Strategy**
   - Models lazy-load on product pages
   - Preload on hover (future)
   - Progressive loading for large models

3. **Caching**
   - Browser caches loaded models
   - Models served from `/public/` (CDN-ready)

4. **Code Splitting**
   - Dynamic imports for all 3D components
   - No SSR impact
   - Loads only when needed

---

## Troubleshooting

### Model Doesn't Load

**Symptoms:** Black screen, infinite loading spinner

**Solutions:**
1. Check browser console for errors
2. Verify model path is correct (relative to `/public/`)
3. Test model in [glTF Viewer](https://gltf-viewer.donmccurdy.com/)
4. Check file size (<10MB)
5. Ensure GLB format (not GLTF with external files)

### Parts Not Clickable

**Symptoms:** Can't select parts on model

**Solutions:**
1. Verify `nodeName` matches GLTF exactly (case-sensitive)
2. Check that geometry exists on the node
3. Ensure material exists in GLB file
4. Look for console warning: "Missing node or material for part: [name]"

### Colors Not Changing

**Symptoms:** Model renders but colors don't update

**Solutions:**
1. Verify `materialName` matches material in GLB
2. Check material type (should be MeshStandardMaterial or similar)
3. Ensure `material-color` prop is being applied
4. Check configuratorStore has the material name initialized

### Wrong Model Appears

**Symptoms:** Different model loads than expected

**Solutions:**
1. Check `modelId` matches registry key exactly
2. Verify registry imports the correct config
3. Clear browser cache: Ctrl+Shift+R (Cmd+Shift+R on Mac)
4. Rebuild: `npm run build`
5. Check `DEFAULT_MODEL_ID` in `models.registry.ts`

### Performance Issues

**Symptoms:** Laggy, low FPS, choppy animations

**Solutions:**
1. Reduce model polygon count
2. Use Draco compression
3. Optimize textures (smaller resolution)
4. Disable shadows: `castShadow={false}`
5. Test on different devices
6. Check browser GPU acceleration enabled

### TypeScript Errors

**Symptoms:** Build fails with type errors

**Solutions:**
1. Ensure all imports use correct paths
2. Verify model config matches `ModelConfig` interface
3. Check `configurator` field added to `Product` interface
4. Run: `npm run type-check` (if available)

---

## Integration with WooCommerce

### Adding Configurator Metadata

#### Option 1: Custom Fields (Recommended for Testing)

In WooCommerce admin:
1. Edit product
2. Add custom fields:
   - `configurator_enabled` = `true`
   - `configurator_model_id` = `shoe-v1`

#### Option 2: GraphQL Extension (Recommended for Production)

Extend your GraphQL schema to include configurator:

```graphql
type Product {
  # ... existing fields
  configurator: ProductConfigurator
}

type ProductConfigurator {
  enabled: Boolean!
  modelId: String!
  customPricing: JSON
  defaultConfiguration: JSON
}
```

Update your product query:

```graphql
query GetProduct($slug: ID!) {
  product(id: $slug, idType: SLUG) {
    # ... existing fields
    configurator {
      enabled
      modelId
      customPricing
      defaultConfiguration
    }
  }
}
```

---

## Project Structure

```
src/
├── components/
│   └── Configurator/
│       ├── README.md                          ← You are here
│       ├── ProductConfigurator.component.tsx  ← Entry point
│       ├── Canvas3D.component.tsx             ← 3D scene
│       ├── ModelViewer.component.tsx          ← Model rendering
│       └── ColorPicker.component.tsx          ← UI overlay
├── config/
│   ├── models.registry.ts                     ← Model registry
│   ├── shoeModel.config.ts                    ← Example config
│   └── [yourModel].config.ts                  ← Your configs
├── stores/
│   └── configuratorStore.ts                   ← State management
├── types/
│   ├── configurator.ts                        ← Type definitions
│   └── product.ts                             ← Product types
└── utils/
    └── apollo/
        └── mockData.ts                        ← Test data

public/
└── models/                                    ← 3D model files
    └── shoe-draco.glb
```

---

## Architecture Decisions

### Why Configuration-Driven?

**Before:** Hardcoded shoe model, ~4 hours to add new model  
**After:** Config file only, ~5 minutes to add new model

Benefits:
- ✅ No component modifications needed
- ✅ Easy to maintain and scale
- ✅ Type-safe with TypeScript
- ✅ Testable and predictable
- ✅ Clear separation of concerns

### Why Integrated (Not Separate App)?

**Decision:** Keep configurator within Next.js app

Benefits:
- ✅ Shared authentication & cart state
- ✅ Unified deployment (one service)
- ✅ Seamless UX (no redirects)
- ✅ Shared dependencies & styling
- ✅ Lower hosting costs

Trade-offs:
- ⚠️ Larger bundle (+500KB, mitigated with code splitting)
- ⚠️ Slight build complexity (webpack config for GLB)

### Why Valtio for State?

**Decision:** Use Valtio over Redux/Zustand

Benefits:
- ✅ Minimal boilerplate
- ✅ Proxy-based (no manual updates)
- ✅ React-friendly hooks
- ✅ TypeScript support
- ✅ Small bundle size

---

## Known Limitations

1. **Model Structure Requirements**
   - GLTF/GLB files must have named nodes and materials
   - Node names must match config exactly
   - Case-sensitive matching

2. **No Runtime Validation**
   - If model file doesn't match config, renders partially
   - Console warnings shown for missing parts
   - No error UI for end users

3. **Single Store Instance**
   - Only one configurator active at a time
   - Multiple configurators on same page share state
   - Future: Instance-based state management

4. **No Persistence**
   - Configuration resets on page refresh
   - Not stored in cart/order (yet)
   - Future: Cart integration planned

---

## Deployment

### Build Configuration

Already configured in `next.config.js`:

```javascript
webpack: (config, { isServer }) => {
  config.module.rules.push({
    test: /\.(glb|gltf)$/,
    type: 'asset/resource',
  });
  
  if (!isServer) {
    config.resolve.fallback = {
      fs: false,
      path: false,
      crypto: false,
    };
  }
  return config;
}
```

### Deployment Checklist

- [ ] All models under 5MB
- [ ] Models in `/public/models/`
- [ ] Build succeeds: `npm run build`
- [ ] Test on staging environment
- [ ] Verify 3D works on production domain
- [ ] Check CORS if using external model hosting
- [ ] Monitor memory usage (3D can be intensive)
- [ ] Test on target devices/browsers

### Hosting Considerations

**Current:** Works with any Next.js host (Render, Vercel, Netlify)

**Recommendations:**
- Use CDN for models if >10 models
- Consider object storage (S3/Cloudinary) for 100+ models
- Monitor memory usage (upgrade plan if needed)
- Enable compression (GZIP/Brotli)

---

## Support & Resources

### Documentation

- **This File:** Complete reference
- **Type Definitions:** `src/types/configurator.ts`
- **Example Config:** `src/config/shoeModel.config.ts`
- **Testing Guide:** See [Testing section](#testing)

### External Resources

- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [glTF Viewer](https://gltf-viewer.donmccurdy.com/)
- [gltf-pipeline](https://github.com/CesiumGS/gltf-pipeline)
- [Draco Compression](https://google.github.io/draco/)

### Development Tips

1. **Use glTF Viewer for debugging**
2. **Name nodes clearly in your 3D software**
3. **Test models before integration**
4. **Keep configs documented**
5. **Version your model files** (e.g., `model-v1.glb`, `model-v2.glb`)

---

## Changelog

### Version 2.0 (October 2025)
- ✅ Refactored to configuration-driven system
- ✅ Added model registry
- ✅ Made all components generic
- ✅ Added TypeScript interfaces
- ✅ Conditional rendering based on product metadata
- ✅ Full backward compatibility maintained

### Version 1.0 (Initial POC)
- ✅ Shoe model hardcoded implementation
- ✅ Basic color customization
- ✅ SSR-safe dynamic imports
- ✅ Valtio state management

---

## License

Part of the Next.js/WooCommerce application.  
See project root LICENSE file.

---

**Questions or issues?** Check [Troubleshooting](#troubleshooting) or review the code in `src/components/Configurator/`
