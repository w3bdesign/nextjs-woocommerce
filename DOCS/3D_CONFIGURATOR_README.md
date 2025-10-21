# 3D Product Configurator

## Overview

This is a proof-of-concept integration of a 3D product configurator into the existing Next.js/WooCommerce application. The configurator allows users to customize product colors in real-time using an interactive 3D model.

## Technology Stack

- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Helper utilities for react-three-fiber
- **three** - WebGL 3D library
- **valtio** - Proxy-based state management
- **react-colorful** - Color picker component

## Architecture

### Components

1. **ProductConfigurator.component.tsx** - Main orchestrator component
   - Handles dynamic imports for SSR compatibility
   - Coordinates Canvas, Model, and ColorPicker

2. **Canvas3D.component.tsx** - 3D rendering context
   - Sets up camera, lighting, and controls
   - Provides environment for 3D models

3. **ModelViewer.component.tsx** - 3D model loader and renderer
   - Loads GLTF/GLB models
   - Handles user interactions (click, hover)
   - Applies material color changes in real-time

4. **ColorPicker.component.tsx** - Color customization UI
   - HexColorPicker integration
   - Displays selected part name
   - Updates model colors via Valtio store

### State Management

**configuratorStore.ts** - Valtio proxy store
- Manages currently selected part
- Stores color values for all customizable parts
- Provides helper functions for state updates

## Current Implementation

### Location
The configurator is currently displayed on **ALL product pages** as a POC at:
- Path: `/product/[slug]`
- Component: `SingleProduct.component.tsx`

### Features
- ✅ Real-time 3D model rendering
- ✅ Interactive part selection (click on model)
- ✅ Color customization with hex color picker
- ✅ Smooth animations and transitions
- ✅ Responsive design
- ✅ SSR-safe implementation (dynamic imports)

### Test Model
The POC uses a shoe model (`/public/shoe-draco.glb`) with 8 customizable parts:
- laces
- mesh
- caps
- inner
- sole
- stripes
- band
- patch

## Usage

### How to Use
1. Navigate to any product page
2. Scroll to the "3D Product Configurator (POC)" section
3. Click on different parts of the 3D model
4. Use the color picker to customize the selected part
5. Model updates in real-time

### Adding Your Own Models

1. **Export your 3D model** as GLTF/GLB format from Blender, Maya, or other 3D software
2. **Optimize the model** using gltf-pipeline or Draco compression
3. **Place the model** in `/public/` directory
4. **Update ModelViewer.component.tsx** to match your model's structure:

```tsx
// Update the mesh mapping to match your model's parts
<mesh
  receiveShadow
  castShadow
  geometry={nodes.your_part_name.geometry}
  material={materials.your_material_name}
  material-color={snap.items.your_material_name}
/>
```

5. **Update configuratorStore.ts** with your part names:

```tsx
items: {
  your_part_1: '#ffffff',
  your_part_2: '#ffffff',
  // ... more parts
}
```

## Next Steps

### Short Term
- [ ] Add product-specific model selection (different models for different products)
- [ ] Integrate configurator data with cart system
- [ ] Add "Save Configuration" button
- [ ] Implement configuration preview in cart
- [ ] Add material/texture options (not just colors)

### Medium Term
- [ ] Create admin interface to associate models with products
- [ ] Store custom configurations in database
- [ ] Add configuration pricing logic
- [ ] Implement preset color schemes
- [ ] Add screenshot/share functionality
- [ ] Mobile optimization and touch gestures

### Long Term
- [ ] AR viewing capabilities (mobile)
- [ ] Advanced material selection (leather, fabric, metal)
- [ ] Dimension customization
- [ ] Real-time pricing updates based on selections
- [ ] Multi-product configurator (furniture sets)
- [ ] Integration with manufacturing/order system

## Performance Considerations

### Current Optimizations
- ✅ Dynamic imports to avoid SSR issues
- ✅ Code splitting for 3D components
- ✅ Draco compression for models
- ✅ Proper memory cleanup on unmount

### Recommendations for Production
1. **Model Optimization**
   - Keep models under 5MB
   - Use Draco compression
   - Implement LOD (Level of Detail) for mobile

2. **Loading Strategy**
   - Preload models on product list pages
   - Show loading spinner during model load
   - Implement progressive loading for large scenes

3. **Caching**
   - Cache models in browser storage
   - Use CDN for static 3D assets
   - Implement service worker for offline support

## Deployment

The configurator is ready to deploy as-is. It requires:
- Node.js environment (already configured)
- No additional server requirements
- Static assets in `/public/`

### Render.com Considerations
- Default deployment works without changes
- Consider upgrading to Standard plan if traffic increases
- Monitor memory usage (3D can be memory-intensive)

## Troubleshooting

### Common Issues

**1. "useGLTF is not defined" or similar errors**
- Ensure all components are dynamically imported with `ssr: false`

**2. Model not loading**
- Check console for 404 errors
- Verify model path matches file location in `/public/`
- Ensure model is valid GLTF/GLB format

**3. Performance issues**
- Reduce model polygon count
- Optimize textures (compress, reduce resolution)
- Disable shadows if needed: `castShadow={false}`

**4. TypeScript errors**
- Run `npm install --save-dev @types/three`
- Check that all imports have proper type definitions

## Files Modified

- `package.json` - Added 3D dependencies
- `next.config.js` - Added webpack config for GLB files
- `src/styles/globals.css` - Added configurator styles
- `src/components/Product/SingleProduct.component.tsx` - Integrated configurator

## Files Created

- `src/stores/configuratorStore.ts`
- `src/components/Configurator/Canvas3D.component.tsx`
- `src/components/Configurator/ModelViewer.component.tsx`
- `src/components/Configurator/ColorPicker.component.tsx`
- `src/components/Configurator/ProductConfigurator.component.tsx`

## License

Same as parent project.

## Support

For issues or questions about the 3D configurator, check:
- React Three Fiber docs: https://docs.pmnd.rs/react-three-fiber
- Three.js docs: https://threejs.org/docs/
- Valtio docs: https://github.com/pmndrs/valtio
