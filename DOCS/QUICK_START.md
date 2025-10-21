# Quick Start Guide - 3D Configurator

## Setup Complete ✅

The 3D configurator has been successfully integrated into your application!

## What Was Done

### 1. Dependencies Installed
- ✅ @react-three/fiber (3D rendering)
- ✅ @react-three/drei (3D utilities)
- ✅ three (WebGL library)
- ✅ valtio (state management)
- ✅ react-colorful (color picker)

### 2. Files Created
```
src/
├── stores/
│   └── configuratorStore.ts              ← State management
└── components/
    └── Configurator/
        ├── Canvas3D.component.tsx        ← 3D rendering context
        ├── ModelViewer.component.tsx     ← Model loader
        ├── ColorPicker.component.tsx     ← UI controls
        └── ProductConfigurator.component.tsx  ← Main component
```

### 3. Files Modified
- `package.json` - Added dependencies
- `next.config.js` - Configured for 3D assets
- `src/styles/globals.css` - Added styles
- `src/components/Product/SingleProduct.component.tsx` - Integrated configurator

## How to Test

### 1. Start Development Server
```bash
npm run dev
```

Server should be running at: http://localhost:3000

### 2. Navigate to Any Product Page
Example: http://localhost:3000/product/[any-product-slug]

### 3. Test the Configurator
- Scroll to "3D Product Configurator (POC)" section
- Click on different parts of the 3D shoe model
- Use the color picker to change colors
- Watch the model update in real-time

## Current Demo Model

The POC uses a shoe model with 8 customizable parts:
- **Location:** `/public/shoe-draco.glb`
- **Size:** 1.2MB (Draco compressed)
- **Parts:** laces, mesh, caps, inner, sole, stripes, band, patch

## Using Your Own 3D Models

### Step 1: Prepare Your Model
1. Export as GLTF or GLB from your 3D software
2. Optimize with: https://gltf.online/ or Draco compression
3. Keep file size under 5MB

### Step 2: Add to Project
```bash
# Place your model in public directory
cp your-model.glb /home/szpeq/dev/mebl/public/
```

### Step 3: Update ModelViewer Component

**File:** `src/components/Configurator/ModelViewer.component.tsx`

Find the model loading line:
```tsx
const { nodes, materials } = useGLTF(modelPath) as any;
```

And the mesh rendering section. Update with your model's part names:
```tsx
<mesh
  receiveShadow
  castShadow
  geometry={nodes.YOUR_PART_NAME.geometry}
  material={materials.YOUR_MATERIAL_NAME}
  material-color={snap.items.YOUR_MATERIAL_NAME}
/>
```

### Step 4: Update Store

**File:** `src/stores/configuratorStore.ts`

Update the items object with your part names:
```tsx
items: {
  armrest: '#ffffff',
  cushion: '#ffffff',
  frame: '#ffffff',
  // ... your parts
}
```

## How to Deploy

### To Render.com (No Changes Needed!)

Your existing deployment process works as-is:

```bash
# Commit your changes
git add .
git commit -m "Add 3D configurator"
git push origin master
```

Render.com will automatically:
1. Install new dependencies
2. Build with 3D support
3. Deploy updated application

Build time will increase by ~1 minute (acceptable).

## Troubleshooting

### Issue: Model doesn't load
**Solution:**
- Check browser console for errors
- Verify model is in `/public/` directory
- Ensure model path in ModelViewer is correct: `/your-model.glb`

### Issue: "useGLTF is not defined"
**Solution:**
- Restart development server: `npm run dev`
- Clear `.next` cache: `rm -rf .next && npm run dev`

### Issue: Performance is slow
**Solution:**
- Reduce model polygon count in 3D software
- Use Draco compression: https://github.com/google/draco
- Disable shadows: `castShadow={false}` in ModelViewer

### Issue: TypeScript errors
**Solution:**
- Types should be installed automatically
- If not: `npm install --save-dev @types/three`

## Understanding the Architecture

### Component Flow
```
Product Page
    │
    ├── ProductConfigurator (main wrapper)
        │
        ├── Canvas3D (3D scene setup)
        │   └── ModelViewer (loads & renders 3D model)
        │
        └── ColorPicker (UI for customization)
            └── Reads/writes to configuratorStore
```

### State Flow
```
User clicks model part
    ↓
ModelViewer detects click
    ↓
Updates configuratorStore.current
    ↓
ColorPicker displays
    ↓
User selects color
    ↓
Updates configuratorStore.items[part]
    ↓
ModelViewer re-renders with new color
```

## Next Steps

### Phase 1: Test & Validate (This Week)
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Verify performance with Lighthouse
- [ ] Get user feedback

### Phase 2: Integrate with Commerce (Week 2-3)
- [ ] Save configuration to cart
- [ ] Display configuration in checkout
- [ ] Pass to WooCommerce as product metadata
- [ ] Test end-to-end purchase flow

### Phase 3: Add Real Models (Week 3-4)
- [ ] Create or commission 3D models for your furniture
- [ ] Optimize models for web
- [ ] Replace demo shoe model
- [ ] Create model library

### Phase 4: Enhance Features (Month 2)
- [ ] Add material/texture options (beyond colors)
- [ ] Implement preset color schemes
- [ ] Add "Save Configuration" button
- [ ] Screenshot/share functionality

## Performance Checklist

Run these checks before production:

### Lighthouse Audit
```bash
# Install Lighthouse CLI
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=http://localhost:3000/product/test-slug
```

**Target Scores:**
- Performance: >70 (acceptable for 3D)
- Accessibility: >90
- Best Practices: >90
- SEO: >90

### Bundle Size Check
```bash
npm run build
```

Look for output:
```
Page                                       Size     First Load JS
┌ ○ /product/[slug]                       2.1 kB     1.2 MB      ← Should be under 2MB
```

### Memory Usage Test
1. Open Chrome DevTools
2. Go to Performance tab
3. Record while interacting with configurator
4. Check memory usage (should stay under 100MB)

## Common Customizations

### Change Canvas Background
**File:** `src/components/Configurator/Canvas3D.component.tsx`
```tsx
<Canvas
  style={{ 
    background: '#f0f0f0',  // Change this color
    width: '100%',
    height: '100%'
  }}
>
```

### Adjust Camera Position
**File:** `src/components/Configurator/Canvas3D.component.tsx`
```tsx
<Canvas
  camera={{ 
    position: [2, 2, 5],  // [x, y, z] - adjust these
    fov: 50               // Field of view (35-75)
  }}
>
```

### Modify Animation Speed
**File:** `src/components/Configurator/ModelViewer.component.tsx`
```tsx
useFrame((state) => {
  const t = state.clock.getElapsedTime();
  ref.current.rotation.set(
    Math.cos(t / 8) / 8,   // Increase divisor to slow down
    Math.sin(t / 8) / 8,
    -0.2 - (1 + Math.sin(t / 3)) / 20
  );
});
```

### Change Default Colors
**File:** `src/stores/configuratorStore.ts`
```tsx
items: {
  laces: '#ff6b6b',      // Red
  mesh: '#4ecdc4',       // Teal
  caps: '#45b7d1',       // Blue
  // ... etc
}
```

## Getting Help

### Documentation
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Manual](https://threejs.org/manual/)
- [Valtio Guide](https://github.com/pmndrs/valtio)

### Debug Mode
Add this to see what's happening:
```tsx
// In ModelViewer.component.tsx
useEffect(() => {
  console.log('Current selection:', snap.current);
  console.log('All colors:', snap.items);
}, [snap.current, snap.items]);
```

### Community
- [Poimandres Discord](https://discord.gg/poimandres) - React Three Fiber community
- [Three.js Forum](https://discourse.threejs.org/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-three-fiber)

## Important Files Reference

| File | Purpose | Modify When |
|------|---------|-------------|
| `configuratorStore.ts` | State management | Adding new parts or changing defaults |
| `ModelViewer.component.tsx` | 3D model logic | Using different models |
| `Canvas3D.component.tsx` | Scene setup | Changing lighting or camera |
| `ColorPicker.component.tsx` | UI controls | Customizing UI appearance |
| `ProductConfigurator.component.tsx` | Main wrapper | Changing layout or structure |

## Success Indicators

You'll know it's working when:
- ✅ 3D model loads and displays on product page
- ✅ You can rotate the model with mouse/touch
- ✅ Clicking parts shows the color picker
- ✅ Color changes reflect immediately on the model
- ✅ No console errors in browser DevTools
- ✅ Page loads in under 5 seconds

## Support & Maintenance

### Weekly Checks
- Monitor error logs
- Check bundle size hasn't grown
- Review user feedback

### Monthly Updates
```bash
# Update dependencies
npm update @react-three/fiber @react-three/drei three

# Test after updates
npm run dev
```

### Backup Strategy
Your 3D models should be:
- ✅ Version controlled (Git LFS for large files)
- ✅ Backed up separately (S3, Cloudinary, or local storage)
- ✅ Documented with source files (.blend, .max, etc.)

---

## You're All Set! 🎉

The 3D configurator is ready to use. Visit any product page to see it in action.

**Current Status:** ✅ Development Ready, POC Complete

**Next Milestone:** Replace demo model with your first furniture piece

**Questions?** Check the detailed docs:
- `DOCS/3D_CONFIGURATOR_README.md` - Feature documentation
- `DOCS/3D_CONFIGURATOR_ARCHITECTURE.md` - Technical decisions and scaling

Happy configuring! 🚀
