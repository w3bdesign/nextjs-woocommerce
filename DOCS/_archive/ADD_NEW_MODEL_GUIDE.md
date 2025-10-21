# Quick Reference: Adding New 3D Models

**Use this guide to quickly add new 3D models to the configurator.**

---

## 📋 Prerequisites

- 3D model in GLTF/GLB format (optimized with Draco compression)
- Model placed in `/public/models/` directory
- Know the node names and material names in your model

---

## 🚀 3-Step Process

### Step 1: Create Model Config (5 min)

Create a new file: `src/config/[modelName]Model.config.ts`

```typescript
import type { ModelConfig } from '@/types/configurator';

export const YOUR_MODEL_CONFIG: ModelConfig = {
  id: 'your-model-v1',              // Unique ID
  name: 'Your Model Name',          // Display name
  modelPath: '/models/your-model.glb', // Path in /public/
  
  parts: [
    {
      nodeName: 'part_1',           // From GLTF file
      materialName: 'material_1',   // From GLTF file
      displayName: 'Part Name',     // User-friendly name
      defaultColor: '#ffffff',      // Default hex color
    },
    // Add more parts...
  ],
  
  // Optional:
  animations: {
    enableRotation: true,
    enableBobbing: true,
  },
};
```

**How to find node/material names:**
- Open your GLB in [glTF Viewer](https://gltf-viewer.donmccurdy.com/)
- Inspect the scene hierarchy
- Note mesh names (nodes) and material names

---

### Step 2: Register Model (30 sec)

Edit: `src/config/models.registry.ts`

```typescript
import { YOUR_MODEL_CONFIG } from './yourModel.config';

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  'shoe-v1': SHOE_CONFIG,
  'your-model-v1': YOUR_MODEL_CONFIG,  // Add this line
};
```

---

### Step 3: Associate with Product

#### Option A: For Testing (Hardcode)

Edit the product component to pass your modelId:

```tsx
<ProductConfigurator modelId="your-model-v1" />
```

#### Option B: For Production (Database)

Add configurator metadata to your product in WooCommerce/GraphQL:

```graphql
mutation UpdateProduct {
  updateProduct(input: {
    id: "product-id"
    # ... other fields
    configurator: {
      enabled: true
      modelId: "your-model-v1"
    }
  }) {
    product {
      id
      configurator {
        enabled
        modelId
      }
    }
  }
}
```

Or if using custom fields in WooCommerce:
- Add custom field: `configurator_enabled` = `true`
- Add custom field: `configurator_model_id` = `your-model-v1`
- Update your GraphQL query to include these fields

---

## 🎨 Model Configuration Options

### Basic Configuration
```typescript
{
  id: 'unique-id',
  name: 'Display Name',
  modelPath: '/path/to/model.glb',
  parts: [/* ... */],
}
```

### With Color Restrictions
```typescript
parts: [
  {
    nodeName: 'fabric',
    materialName: 'cushion',
    displayName: 'Cushion',
    defaultColor: '#cccccc',
    allowedColors: ['#ff0000', '#00ff00', '#0000ff'], // Only these colors
  },
]
```

### With Custom Camera
```typescript
{
  // ... basic config
  camera: {
    position: [0, 2, 5],  // [x, y, z]
    fov: 50,              // Field of view
  },
}
```

### With Custom Animations
```typescript
{
  // ... basic config
  animations: {
    enableRotation: true,
    enableBobbing: false,
    rotationSpeed: 0.5,    // Slower rotation
    bobbingAmplitude: 0.2, // More bobbing
  },
}
```

### With Metadata
```typescript
{
  // ... basic config
  metadata: {
    description: 'Modern sofa with customizable fabric and legs',
    tags: ['furniture', 'sofa', 'living-room'],
    version: '1.0.0',
  },
}
```

---

## 🔍 Troubleshooting

### Model Doesn't Load
```
Problem: Black screen or loading spinner forever
Solution:
1. Check browser console for errors
2. Verify model path is correct (relative to /public/)
3. Ensure GLB file is valid (open in gltf-viewer.donmccurdy.com)
4. Check file size (<5MB recommended)
```

### Parts Not Clickable
```
Problem: Can't select parts in the model
Solution:
1. Verify nodeName matches exactly (case-sensitive)
2. Check that geometry exists on the node
3. Ensure material exists in the GLB file
4. Console will show warning: "Missing node or material for part: [name]"
```

### Colors Not Changing
```
Problem: Model renders but colors don't update
Solution:
1. Verify materialName matches material in GLB
2. Check that material is a MeshStandardMaterial or similar
3. Ensure material-color property is being set
4. Check configuratorStore has the material name
```

### Wrong Model Appears
```
Problem: Different model loads than expected
Solution:
1. Check modelId matches registry key exactly
2. Verify registry imports the correct config
3. Clear browser cache and rebuild
4. Check DEFAULT_MODEL_ID in models.registry.ts
```

---

## 📦 Example: Adding a Chair Model

```typescript
// 1. src/config/chairModel.config.ts
import type { ModelConfig } from '@/types/configurator';

export const CHAIR_CONFIG: ModelConfig = {
  id: 'chair-office-v1',
  name: 'Office Chair',
  modelPath: '/models/office-chair.glb',
  
  parts: [
    {
      nodeName: 'seat',
      materialName: 'fabric',
      displayName: 'Seat Cushion',
      defaultColor: '#333333',
    },
    {
      nodeName: 'back',
      materialName: 'mesh',
      displayName: 'Back Support',
      defaultColor: '#222222',
    },
    {
      nodeName: 'base',
      materialName: 'metal',
      displayName: 'Base Frame',
      defaultColor: '#888888',
    },
  ],
};

// 2. src/config/models.registry.ts
import { CHAIR_CONFIG } from './chairModel.config';

export const MODEL_REGISTRY = {
  'shoe-v1': SHOE_CONFIG,
  'chair-office-v1': CHAIR_CONFIG, // Added
};

// 3. In component or product data
<ProductConfigurator modelId="chair-office-v1" />
```

---

## ✅ Testing Your Model

After adding your model:

1. **Build**: `npm run build` - Should succeed without errors
2. **Run dev**: `npm run dev`
3. **Navigate** to product page
4. **Verify**:
   - [ ] Model renders
   - [ ] All parts are visible
   - [ ] Parts are clickable
   - [ ] Color picker appears
   - [ ] Colors update in real-time
   - [ ] Animations work
   - [ ] No console errors

---

## 🎓 Best Practices

1. **Model Optimization**
   - Use Draco compression: `gltf-pipeline -i model.glb -o model-draco.glb -d`
   - Keep under 5MB
   - Reduce polygon count (<50k triangles)

2. **Naming Conventions**
   - Model ID: `product-variant-version` (e.g., 'sofa-modern-v1')
   - Node names: Clear and descriptive (e.g., 'seat_cushion' not 'mesh_001')
   - Material names: Logical grouping (e.g., 'fabric_blue' not 'material_5')

3. **Testing**
   - Test on different browsers
   - Test on mobile devices
   - Test with slow 3G connection
   - Verify all parts are accessible

4. **Documentation**
   - Add comments to your config
   - Document special requirements
   - Note any custom camera positions

---

## 📞 Need Help?

- **Check docs**: `DOCS/CONFIGURATOR_REFACTORING_SUMMARY.md`
- **Type definitions**: `src/types/configurator.ts`
- **Example config**: `src/config/shoeModel.config.ts`
- **Registry code**: `src/config/models.registry.ts`

---

**That's it! Your new model should now be working. 🎉**
