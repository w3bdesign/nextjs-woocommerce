# Comprehensive Implementation Plan Review: Dimension-Driven Variant Switching

## 1. Executive Summary

- **Overall Assessment**: The plan provides a solid architectural foundation but has **11 critical gaps** in resource management, race conditions, and data contract enforcement that could cause production failures.
- **Core Strength**: Clean separation of concerns with family-based config system and existing `sceneMediatorStore` pattern is excellent for this feature.
- **Critical Risk**: No Three.js resource disposal strategy defined - preloading multiple GLBs without cleanup will cause **memory leaks and browser crashes** within minutes of use.
- **Race Condition Vulnerability**: Debounced variant resolution + preloaded models creates **3 concurrent async flows** (dimension change → variant resolve → model swap → bbox recalc) with no synchronization primitives.
- **Data Contract Gap**: Plan lacks **depth-dimension isolation** enforcement - current `setDimensions(width, height, depth)` API allows depth to accidentally trigger variant logic despite requirements stating depth must never influence switching.
- **Confidence Level**: 60% - Requires 8 P0 fixes before implementation to prevent critical failures.

---

## 2. Top 10 Prioritized Findings

### **CRITICAL**

**1. No Three.js Resource Disposal Strategy**

- **Issue**: Plan calls `preloadFamilyModels()` to cache all GLBs in `Map<string, GLTF>` but never disposes old model geometries/textures when switching variants.
- **Why Critical**: Each GLB contains geometries, textures, materials. Without calling `geometry.dispose()`, `texture.dispose()`, `material.dispose()`, GPU memory accumulates. With 3 variants × 2MB each, user sliding back/forth 10 times = 60MB leaked.
- **Fix**: Add `disposeVariantModel(variantId)` utility that traverses GLTF scene, calls `.dispose()` on all resources, removes from preload cache. Call when variant becomes inactive for >30 seconds (LRU strategy).

**2. Race Condition: Dimension Change → Variant Resolve → Model Swap**

- **Issue**: User drags slider rapidly: `setDimensions()` → debounced `resolveVariant()` (150ms) → `switchVariant()` → ModelViewer reads `preloadedModels`. No locks/flags prevent multiple concurrent switches.
- **Why Critical**: Sequence: dimension 80cm → 100cm → 120cm in 200ms triggers 3 debounced resolves. Last one wins, but `switchVariant()` might execute out-of-order if model cache lookup timing varies.
- **Fix**: Add `isResolvingVariant: boolean` flag to store. In `setDimensions()`, return early if flag is true. Set flag before async operations, clear after `switchVariant()` completes. Add request ID tracking.

**3. Depth-Dimension Isolation Not Enforced**

- **Issue**: Plan defines `setDimensions(width, height, depth)` but doesn't prevent depth from being passed to `resolveVariantForDimensions({ width, height })`. Caller could accidentally include depth in resolution.
- **Why Critical**: Requirements explicitly state "depth never triggers switching". Current API allows programming errors to violate this.
- **Fix**:

```typescript
// In configuratorStore
setDimensions({ width, height, depth }: Dimensions) {
  // Update depth independently (no variant check)
  this.dimensions.length = depth;

  // Only width/height trigger variant resolution
  const newVariant = debouncedResolveVariant({ width, height }, currentFamily);
  if (newVariant && newVariant.id !== this.activeVariantId) {
    this.switchVariant(newVariant.id);
  }
}
```

**4. Bounding Box Recalculation During Variant Switch Undefined**

- **Issue**: Step 4 says "Add `useEffect` watching `snap.activeVariantId` to trigger bounding box recalculation" but doesn't specify **how** or **when**. Current ModelViewer calculates bbox on initial mount only.
- **Why Critical**: Camera presets depend on `sceneMediatorStore.modelWorld.boundingBox`. If bbox isn't recalculated after variant swap, camera might be positioned for old model dimensions (e.g., close-up on 2-drawer when 3-drawer is now displayed).
- **Fix**: In ModelViewer, add:

```typescript
useEffect(() => {
  if (!ref.current || !snap.activeVariantId) return;

  // Recompute bounding box for new variant
  const box = new THREE.Box3().setFromObject(ref.current);
  const newBbox = {
    min: { x: box.min.x, y: box.min.y, z: box.min.z },
    max: { x: box.max.x, y: box.max.y, z: box.max.z },
  };
  setModelWorld(newBbox, modelConfig.position, finalScale[0]);
}, [snap.activeVariantId]);
```

### **HIGH**

**5. Customization Transfer Logic Incomplete**

- **Issue**: Step 3 mentions `transferCustomizations(oldConfig, newConfig, currentState)` but doesn't define **part name matching strategy**. What if old model has `'m_cabinet'` and new has `'m_cabinet_body'`?
- **Why High**: Without fuzzy/prefix matching, all customizations reset on variant switch (bad UX). User picks walnut finish on 2-drawer, switches to 3-drawer, gets default brown.
- **Fix**: Implement strategy:
  1. Exact match first (`'m_cabinet'` → `'m_cabinet'`)
  2. Prefix match (`'m_cabinet'` → `'m_cabinet_body'` if starts with `'m_cabinet'`)
  3. Log warning via `debug.warn()` for unmapped parts
  4. Apply defaults for new parts not in old config

**6. Preload Failure Handling Missing**

- **Issue**: `preloadFamilyModels()` calls `GLTFLoader.load()` for all variants but plan doesn't specify error handling if one GLB 404s or is corrupted.
- **Why High**: If variant 2 fails to load, entire configurator might freeze. User can't proceed to cart.
- **Fix**:

```typescript
async function preloadFamilyModels(family) {
  const results = await Promise.allSettled(
    family.variants.map((v) => loadGLTF(v.modelPath)),
  );

  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    debug.error('Failed to preload variants:', failed);
    // Remove failed variants from family.variants array
    // Show user notification: "Some size options unavailable"
  }
}
```

**7. Slider Min/Max Calculation Ambiguity**

- **Issue**: Step 5 says "Compute slider min/max from family's aggregate dimension ranges (min of all variant mins, max of all variant maxes)" but doesn't specify behavior when ranges DON'T overlap. Example: Variant A width [60-90], Variant B width [100-120]. Gap at 90-100cm.
- **Why High**: User slides to 95cm → no matching variant → plan says "clamp to nearest" but slider allows 95cm. UI shows invalid state until clamp happens.
- **Fix**: Two options:
  - **Option A**: Slider spans full range [60-120], show visual indicator (red zone) for gaps [90-100]
  - **Option B**: Slider restricted to union of valid ranges only (disjointed ranges = two separate sliders)
  - **Recommendation**: Option A for simplicity, add `isValidDimension()` helper that checks if current value falls in ANY variant's range

**8. GraphQL Schema Change Breaks Existing Queries**

- **Issue**: Step 6 changes `_configurator_model_id` meta to `_configurator_family_id` and exposes `familyId` in GraphQL. Existing frontend queries requesting `modelId` will return null/error.
- **Why High**: If WP plugin is deployed before frontend, product page breaks instantly.
- **Fix**: Dual-field strategy:

```php
// In GraphQL extension, expose both fields temporarily
'modelId' => ['type' => 'String', 'description' => 'DEPRECATED: Use familyId'],
'familyId' => ['type' => 'String'],

// Resolver populates both from same meta:
$familyId = get_post_meta($product->ID, '_configurator_family_id', true);
return [
  'familyId' => $familyId,
  'modelId' => $familyId, // Backward compat
];
```

Remove `modelId` after 2-week migration window.

### **MEDIUM**

**9. DimensionControls Variant Name Display Not Specified**

- **Issue**: Step 5 says "Display current active variant name (e.g., '2-Drawer Cabinet' → '3-Drawer Cabinet') subtly below sliders" but doesn't specify **WHERE** variant display names come from. `ModelConfig` has `.name` but that's the model name ('Bar Cabinet'), not variant name ('2-Drawer').
- **Why Medium**: Without variant display names in data model, UI can't show meaningful labels. Fallback to showing `activeVariantId` ('cabinet-v1') is developer-facing, not user-friendly.
- **Fix**: Add `displayName` to family variant schema:

```typescript
interface FamilyVariant {
  id: string;
  displayName: string; // "Small (2 Drawers)", "Medium (3 Drawers)"
  constraints: {
    width: [number, number];
    height: [number, number];
    depth: [number, number];
  };
  modelId: string; // References MODEL_REGISTRY key
}
```

**10. Cart Serialization Size Bloat**

- **Issue**: Step 8 adds `familyId`, `activeVariantId`, "full variant metadata snapshot (dimension constraints, modelPath)" to cart extraData. A 3-variant family with constraints = ~500 bytes JSON per cart item.
- **Why Medium**: WooCommerce stores cart in PHP session/DB. 20 items × 500 bytes = 10KB session overhead. Not critical but wasteful.
- **Fix**: Store only identifiers:

```typescript
serializeConfiguratorState() {
  return JSON.stringify({
    familyId: snap.familyId,
    activeVariantId: snap.activeVariantId,
    dimensions: snap.dimensions, // 3 numbers
    items: snap.items, // Color map
    interactiveStates: snap.interactiveStates,
    // DON'T store constraints/modelPath - backend can reconstruct from variantId
  });
}
```

---

## 3. Detailed Review by Perspective

### **Functional Correctness**

**Findings:**

1. **Variant resolution tie-breaking undefined** - If two variants have identical range sum, which is chosen? Algorithm uses `sort()` on ranges but doesn't specify secondary sort key (e.g., variant order in array).
2. **Scaling axes application unclear** - Plan mentions `scalableAxes: ["x", "y"]` but doesn't specify what happens to Z-axis. Is it locked at scale 1.0? Current ModelViewer applies scale to all 3 axes.
3. **Interactive states preservation** - Plan says "preserve door positions" but doesn't specify how to map `interactiveStates` when variant has different door node names.

**Concrete Example - Scaling Axes Issue:**

```typescript
// Current ModelViewer (line 142-156):
finalScale = [baseScale * scaleX, baseScale * scaleY, baseScale * scaleZ];

// Should become (respecting scalableAxes):
const scalableAxes = variant.scalableAxes || ['x', 'y', 'z']; // Default all
finalScale = [
  scalableAxes.includes('x') ? baseScale * scaleX : baseScale,
  scalableAxes.includes('y') ? baseScale * scaleY : baseScale,
  scalableAxes.includes('z') ? baseScale * scaleZ : baseScale,
];
```

**Suggested Fixes:**

```typescript
// variantResolver.ts
export function resolveVariantForDimensions({ width, height }, family) {
  const matches = family.variants.filter((v) => {
    const [wMin, wMax] = v.constraints.width;
    const [hMin, hMax] = v.constraints.height;
    return width >= wMin && width <= wMax && height >= hMin && height <= hMax;
  });

  if (matches.length === 0) return null;

  // Sort by range size, then by array index (stable)
  matches.sort((a, b) => {
    const aRange =
      a.constraints.width[1] -
      a.constraints.width[0] +
      (a.constraints.height[1] - a.constraints.height[0]);
    const bRange =
      b.constraints.width[1] -
      b.constraints.width[0] +
      (b.constraints.height[1] - b.constraints.height[0]);
    if (aRange !== bRange) return aRange - bRange;

    // Tie-breaker: prefer earlier variant in family definition
    return family.variants.indexOf(a) - family.variants.indexOf(b);
  });

  return matches[0];
}

// transferCustomizations utility
export function transferCustomizations(
  oldConfig,
  newConfig,
  currentItems,
  currentStates,
) {
  const newItems = { ...currentItems };
  const newStates = { ...currentStates };

  // Map material colors
  Object.entries(currentItems).forEach(([oldPartName, color]) => {
    // Exact match first
    if (newConfig.parts.some((p) => p.materialName === oldPartName)) {
      newItems[oldPartName] = color;
      return;
    }

    // Prefix match
    const prefixMatch = newConfig.parts.find(
      (p) =>
        p.materialName.startsWith(oldPartName) ||
        oldPartName.startsWith(p.materialName),
    );
    if (prefixMatch) {
      newItems[prefixMatch.materialName] = color;
      debug.warn(
        `Mapped ${oldPartName} → ${prefixMatch.materialName} (prefix match)`,
      );
    } else {
      debug.warn(`No match for customization: ${oldPartName}`);
    }
  });

  // Map interactive states (preserve door positions if keys match)
  Object.entries(currentStates).forEach(([stateKey, value]) => {
    if (newConfig.interactiveParts?.some((p) => p.stateKey === stateKey)) {
      newStates[stateKey] = value;
    } else {
      debug.warn(`Interactive state ${stateKey} not found in new variant`);
    }
  });

  return { newItems, newStates };
}
```

---

### **UX / Product**

**Findings:**

1. **No visual feedback during variant switch** - Plan says "no loading indicator" since models are preloaded, but there's still a frame or two of processing during `switchVariant()` execution. User might perceive lag.
2. **Slider behavior during clamping undefined** - If user is at 95cm (invalid gap), does slider snap to 90cm or 100cm? Instant or animated?
3. **Add-to-cart validation missing** - Plan doesn't specify checking if selected dimensions are valid before allowing cart add.

**Suggested Fixes:**

```typescript
// DimensionControls.component.tsx
function handleDimensionChange(
  axis: 'width' | 'height' | 'depth',
  value: number,
) {
  // Optimistic update (immediate UI feedback)
  configuratorStore.dimensions[
    axis === 'width' ? 'width' : axis === 'height' ? 'height' : 'length'
  ] = value;

  // Debounced variant resolution
  debouncedSetDimensions({
    width: snap.dimensions.width,
    height: snap.dimensions.height,
    depth: snap.dimensions.length,
  });
}

// AddToCart validation
function handleAddToCart() {
  const currentVariant = resolveVariantForDimensions(
    { width: snap.dimensions.width, height: snap.dimensions.height },
    currentFamily,
  );

  if (!currentVariant) {
    // Show toast: "Invalid dimensions. Please adjust size."
    toast.error('Please adjust dimensions to a valid size.');
    return;
  }

  // Proceed with cart add
  addToCart({ ...serializeConfiguratorState() });
}
```

---

### **Performance**

**Findings:**

1. **No GLB size limits defined** - Plan says "preload all variants" but doesn't specify acceptable file sizes. If designer uploads 10MB GLB, page load stalls.
2. **Texture memory not accounted** - Each variant might share textures (wood grain) but plan doesn't mention texture deduplication.
3. **No progressive loading strategy** - All variants loaded upfront even if user never changes dimensions.

**Recommendations:**

- **GLB Size Limit**: <1.5MB per variant (justification: 3 variants × 1.5MB = 4.5MB total. On 3G connection = 6-8 second initial load. Acceptable for MVP, not ideal for production).
- **Texture Sharing**: If variants share materials, load textures once, reuse across models via Three.js texture cache.
- **LRU Cache Strategy**: Keep last 2 variants in memory, dispose others.

**Suggested Implementation:**

```typescript
// variantCache.ts - LRU cache with disposal
class VariantCache {
  private cache = new Map<string, { gltf: GLTF; lastAccess: number }>();
  private maxSize = 2;

  set(variantId: string, gltf: GLTF) {
    // Dispose oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldest = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].lastAccess - b[1].lastAccess,
      )[0];

      this.dispose(oldest[0]);
      this.cache.delete(oldest[0]);
    }

    this.cache.set(variantId, { gltf, lastAccess: Date.now() });
  }

  get(variantId: string): GLTF | undefined {
    const entry = this.cache.get(variantId);
    if (entry) {
      entry.lastAccess = Date.now();
      return entry.gltf;
    }
  }

  private dispose(variantId: string) {
    const entry = this.cache.get(variantId);
    if (!entry) return;

    entry.gltf.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });

    debug.log(`Disposed variant: ${variantId}`);
  }
}
```

---

### **Reliability & Race Conditions**

**Findings:**

1. **Debounce + preload creates 3 async flows** - Dimension change → debounced resolve (150ms) → switchVariant reads cache → bbox recalc publishes to mediator. No coordination.
2. **Camera preset recalculation race** - `sceneMediatorStore.modelWorld` update triggers camera preset regeneration, but if user is mid-orbit, camera jumps unexpectedly.
3. **Partial preload state** - If preload Promise resolves for variants 1 and 3 but 2 is still loading, what happens if user slides to variant 2's range?

**Suggested Fixes:**

```typescript
// configuratorStore.ts
interface ConfiguratorState {
  // ... existing fields
  isResolvingVariant: boolean;
  variantResolutionId: number; // Request tracking
}

function setDimensions({ width, height, depth }: Dimensions) {
  // Update depth immediately (no variant check per requirement)
  this.dimensions.length = depth;

  // Increment request ID
  const requestId = ++this.variantResolutionId;

  // Debounced variant resolution
  debouncedResolveAndSwitch(width, height, this.familyId, requestId);
}

async function resolveAndSwitch(
  width: number,
  height: number,
  familyId: string,
  requestId: number,
) {
  // Early exit if newer request started
  if (requestId !== configuratorState.variantResolutionId) return;

  configuratorState.isResolvingVariant = true;

  const family = getModelFamily(familyId);
  const newVariant = resolveVariantForDimensions({ width, height }, family);

  // Check again before switching (another request might have started)
  if (requestId !== configuratorState.variantResolutionId) {
    configuratorState.isResolvingVariant = false;
    return;
  }

  if (newVariant && newVariant.id !== configuratorState.activeVariantId) {
    await switchVariant(newVariant.id);
  }

  configuratorState.isResolvingVariant = false;
}
```

---

### **Resource Management**

**Findings:**

1. **No GPU memory monitoring** - Plan doesn't specify how to detect when memory is exhausted (WebGL context lost).
2. **Material/texture disposal incomplete** - Three.js requires manual `.dispose()` calls. Plan mentions "dispose old model" but doesn't show implementation.
3. **React component unmount cleanup missing** - If user navigates away from product page mid-preload, cleanup isn't specified.

**Suggested Implementation:**

```typescript
// ModelViewer.component.tsx cleanup
useEffect(() => {
  return () => {
    // Cleanup on unmount
    if (ref.current) {
      ref.current.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          const materials = Array.isArray(obj.material)
            ? obj.material
            : [obj.material];
          materials.forEach((m) => {
            m.dispose();
            // Dispose textures
            if (m.map) m.map.dispose();
            if (m.normalMap) m.normalMap.dispose();
            if (m.roughnessMap) m.roughnessMap.dispose();
          });
        }
      });
    }
  };
}, []);

// WebGL context lost handler (add to Canvas3D)
useEffect(() => {
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    debug.error('WebGL context lost - too much GPU memory used');
    // Clear preload cache
    configuratorStore.preloadedModels.clear();
    // Show user message
    toast.error('3D viewer paused due to memory limits. Reloading...');
    setTimeout(() => window.location.reload(), 2000);
  };

  const canvas = canvasRef.current;
  canvas?.addEventListener('webglcontextlost', handleContextLost);
  return () =>
    canvas?.removeEventListener('webglcontextlost', handleContextLost);
}, []);
```

---

### **Data Model & API Contracts**

**Findings:**

1. **Family schema not fully defined** - Plan shows `ModelFamily` interface but doesn't specify if it extends existing `ModelConfig` or is separate.
2. **Variant constraints overlap validation missing** - What if designer defines overlapping ranges? Variant A [60-100], Variant B [90-120] overlap at [90-100].
3. **WordPress meta field JSON validation** - Plan doesn't specify schema validation when saving family config in WP admin.

**Contract Definition:**

```typescript
// types/configurator.ts
export interface ModelFamily {
  familyId: string;
  displayName: string;
  description?: string;
  variants: FamilyVariant[];
  metadata?: {
    defaultVariantId?: string;
    tags?: string[];
  };
}

export interface FamilyVariant {
  id: string; // Unique within family
  displayName: string; // "Small", "Medium", "Large"
  modelId: string; // References MODEL_REGISTRY key (cabinet-v1, cabinet-v2)
  constraints: {
    width: [number, number]; // [min, max] in cm
    height: [number, number];
    depth: [number, number]; // Provided but NEVER used for switching
  };
  scalableAxes?: ('x' | 'y' | 'z')[]; // Default ['x', 'y', 'z']
}

// Validation utility
export function validateFamily(family: ModelFamily): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check all modelIds exist in registry
  family.variants.forEach((v) => {
    if (!hasModel(v.modelId)) {
      errors.push(
        `Variant ${v.id} references non-existent model: ${v.modelId}`,
      );
    }
  });

  // Warn on overlaps (not error - might be intentional)
  for (let i = 0; i < family.variants.length; i++) {
    for (let j = i + 1; j < family.variants.length; j++) {
      const a = family.variants[i];
      const b = family.variants[j];

      const widthOverlap = !(
        a.constraints.width[1] < b.constraints.width[0] ||
        b.constraints.width[1] < a.constraints.width[0]
      );
      const heightOverlap = !(
        a.constraints.height[1] < b.constraints.height[0] ||
        b.constraints.height[1] < a.constraints.height[0]
      );

      if (widthOverlap && heightOverlap) {
        debug.warn(`Variants ${a.id} and ${b.id} have overlapping constraints`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
```

---

### **Backend Consistency**

**Findings:**

1. **Cart metadata doesn't include variant price** - WooCommerce needs price at cart-add time. Plan stores `activeVariantId` but doesn't specify price handling.
2. **Order processing missing variant info** - WordPress order meta plugin needs to know which variant was purchased for fulfillment.
3. **No server-side dimension validation** - Client could POST manipulated dimensions to cart API.

**Suggested Implementation:**

```typescript
// Cart serialization with price
export function serializeConfiguratorState(snap: ConfiguratorState, product: Product) {
  const variant = getCurrentVariant(snap.activeVariantId);
  const basePrice = parseFloat(product.price);

  // For MVP, use base price (no dynamic pricing)
  // In future: calculate based on dimensions/materials

  return JSON.stringify({
    familyId: snap.familyId,
    activeVariantId: snap.activeVariantId,
    variantDisplayName: variant.displayName,
    dimensions: snap.dimensions,
    items: snap.items,
    interactiveStates: snap.interactiveStates,
    price: basePrice, // Include for order record
    timestamp: new Date().toISOString(),
    version: '2.0', // Increment version for family-based system
  });
}

// WordPress order meta display (update plugin)
// In mebl-configurator-order-meta plugin:
function display_configurator_data($order_id) {
  $data = json_decode(get_post_meta($order_id, '_configurator_data', true), true);

  echo '<h3>3D Configuration</h3>';
  echo '<p><strong>Family:</strong> ' . esc_html($data['familyId']) . '</p>';
  echo '<p><strong>Variant:</strong> ' . esc_html($data['variantDisplayName']) . '</p>';
  echo '<p><strong>Dimensions:</strong> ' .
       esc_html($data['dimensions']['width']) . 'cm × ' .
       esc_html($data['dimensions']['height']) . 'cm × ' .
       esc_html($data['dimensions']['length']) . 'cm</p>';
}
```

---

### **Maintainability & Extensibility**

**Findings:**

1. **Adding new variant requires 4-file update** - Model config, family config, registry, WordPress dropdown. No automated sync check.
2. **Type safety between WP and Next.js unclear** - GraphQL returns `familyId: string` but how to ensure it exists in `FAMILY_REGISTRY`?
3. **Config file organization** - Plan doesn't specify where family configs live vs model configs.

**Suggested Structure:**

```
src/config/
  models/
    cabinetModel.config.ts      # Individual model configs (unchanged)
    cabinet2Model.config.ts     # New variant model
    dresserModel.config.ts
  families/
    cabinetFamily.config.ts     # NEW: Family definitions
    dresserFamily.config.ts
  models.registry.ts             # Model registry (unchanged)
  families.registry.ts           # NEW: Family registry
```

**Type-Safe Family Registry:**

```typescript
// families.registry.ts
import { CABINET_FAMILY } from './families/cabinetFamily.config';
import { DRESSER_FAMILY } from './families/dresserFamily.config';
import type { ModelFamily } from '@/types/configurator';

export const FAMILY_REGISTRY: Record<string, ModelFamily> = {
  'cabinet-family-01': CABINET_FAMILY,
  'dresser-family-01': DRESSER_FAMILY,
};

export function getModelFamily(familyId: string): ModelFamily | undefined {
  return FAMILY_REGISTRY[familyId];
}

export function hasFamily(familyId: string): boolean {
  return familyId in FAMILY_REGISTRY;
}

// Validation on app start (catch misconfigs early)
if (process.env.NODE_ENV === 'development') {
  Object.values(FAMILY_REGISTRY).forEach((family) => {
    const validation = validateFamily(family);
    if (!validation.valid) {
      console.error(`Invalid family ${family.familyId}:`, validation.errors);
    }
  });
}
```

---

### **DevOps & Deployment**

**Findings:**

1. **GLB versioning/cache busting undefined** - If designer updates `cabinet-v1.glb`, browsers cache old version. No cache-busting strategy.
2. **CDN configuration not specified** - Where are GLBs hosted? Vercel, S3, WP uploads folder?
3. **No CI check for model file existence** - Can deploy code referencing `cabinet-v3.glb` that doesn't exist.

**Recommendations:**

```yaml
# .github/workflows/validate-models.yml
name: Validate 3D Models
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check model files exist
        run: |
          # Extract model paths from configs
          MODEL_PATHS=$(grep -r "modelPath:" src/config/ | sed "s/.*modelPath: '\\(.*\\)'.*/\\1/")

          for path in $MODEL_PATHS; do
            if [ ! -f "public/$path" ]; then
              echo "ERROR: Model file missing: public/$path"
              exit 1
            fi
          done

      - name: Check GLB file sizes
        run: |
          find public/3d-models -name "*.glb" -size +1500k -exec echo "WARNING: Large GLB: {}" \;
```

**Cache Busting Strategy:**

```typescript
// config/cabinetFamily.config.ts
export const CABINET_FAMILY: ModelFamily = {
  familyId: 'cabinet-family-01',
  displayName: 'Cabinet Series A',
  variants: [
    {
      id: 'cabinet-small',
      modelId: 'cabinet-v1',
      // Add version query param for cache busting
      modelPath: `/cabinet.glb?v=${process.env.NEXT_PUBLIC_MODEL_VERSION || '1'}`,
      constraints: { width: [60, 90], height: [100, 150], depth: [30, 60] },
    },
  ],
};

// In .env.local:
// NEXT_PUBLIC_MODEL_VERSION=2024-12-04-1
```

---

## 4. Actionable Remediation Backlog

### **P0 - Must Fix Before Implementation**

**P0-1: Implement Three.js Resource Disposal**

- **Description**: Add `disposeVariantModel()` utility and LRU cache to prevent memory leaks
- **Acceptance Criteria**:
  - Variant switch disposes old model geometries/textures/materials
  - GPU memory stays <200MB after 50 variant switches
  - No WebGL context lost errors in 10-minute stress test
- **Files**: `src/utils/variantCache.ts` (new), ModelViewer.component.tsx
- **Tests**: Memory leak test (Playwright with Chrome DevTools Protocol), measure GPU memory before/after

**P0-2: Add Variant Resolution Race Condition Guards**

- **Description**: Implement request ID tracking and `isResolvingVariant` flag
- **Acceptance Criteria**:
  - Rapid slider changes (10 changes in 1 second) result in single final variant switch
  - No console errors about undefined variants
  - Request ID sequence verified in debug logs
- **Files**: configuratorStore.ts, `src/utils/variantResolver.ts`
- **Tests**: Integration test with rapid dimension changes, assert only last variant applied

**P0-3: Enforce Depth-Dimension Isolation**

- **Description**: Refactor `setDimensions()` to separate depth handling from variant resolution
- **Acceptance Criteria**:
  - Depth changes NEVER trigger `resolveVariantForDimensions()` call
  - Width/height changes always trigger resolution
  - Unit test verifies depth-only change doesn't call resolver
- **Files**: configuratorStore.ts
- **Tests**: Unit test with mock resolver, assert not called on depth change

**P0-4: Implement Bounding Box Recalculation on Variant Switch**

- **Description**: Add `useEffect` in ModelViewer watching `activeVariantId`
- **Acceptance Criteria**:
  - `sceneMediatorStore.modelWorld.boundingBox` updates within 100ms of variant switch
  - Camera presets recalculate based on new bbox
  - No camera jumps if user not actively controlling
- **Files**: ModelViewer.component.tsx
- **Tests**: E2E test switching variants, assert camera position adapts to new model size

**P0-5: Add Preload Error Handling**

- **Description**: Wrap `preloadFamilyModels()` in `Promise.allSettled()`, handle failures
- **Acceptance Criteria**:
  - If 1+ variants fail to load, show user notification
  - Failed variants removed from available options
  - At least 1 variant loads successfully or show error page
- **Files**: `src/utils/variantResolver.ts`, [slug].tsx
- **Tests**: Mock GLTFLoader failure, assert UI shows fallback

**P0-6: Define Customization Transfer Logic**

- **Description**: Implement `transferCustomizations()` with exact + prefix matching
- **Acceptance Criteria**:
  - Exact material name matches preserved (e.g., `m_cabinet`)
  - Prefix matches work (e.g., `m_cabinet` → `m_cabinet_body`)
  - Unmapped parts logged via `debug.warn()` in dev mode
  - New parts get default colors from new variant config
- **Files**: `src/utils/variantResolver.ts`
- **Tests**: Unit test with mock old/new configs, assert color mappings correct

**P0-7: Implement Slider Min/Max with Gap Handling**

- **Description**: Calculate aggregate family ranges, add `isValidDimension()` helper
- **Acceptance Criteria**:
  - Slider spans full family range [minOfMins, maxOfMaxs]
  - Invalid ranges (gaps) allow slider movement but show visual indicator
  - Add-to-cart validates dimensions, blocks if invalid
- **Files**: DimensionControls.component.tsx
- **Tests**: E2E test with family having gap [90-100], assert slider allows but cart blocks

**P0-8: GraphQL Schema Dual-Field Migration**

- **Description**: Expose both `modelId` (deprecated) and `familyId` in GraphQL for 2-week migration
- **Acceptance Criteria**:
  - Old frontend queries requesting `modelId` still work
  - New queries use `familyId`
  - WP admin saves to `_configurator_family_id` meta
  - GraphQL resolver populates both fields from same source
- **Files**: class-graphql-extension.php, class-meta-fields.php
- **Tests**: GraphQL query test, assert both fields return same value

### **P1 - High Priority, Can Ship Without**

**P1-1: Add Variant Display Names to Schema**

- **Description**: Extend `FamilyVariant` interface with `displayName` field
- **Acceptance Criteria**:
  - Each variant has human-readable name ("Small (2 Drawers)")
  - DimensionControls displays variant name below sliders
  - Cart metadata includes `variantDisplayName`
- **Files**: configurator.ts, `src/config/families/*.config.ts`

**P1-2: Implement WebGL Context Lost Handler**

- **Description**: Add event listener for `webglcontextlost`, trigger cache clear + reload
- **Acceptance Criteria**:
  - Toast notification shown: "3D viewer paused due to memory limits"
  - Page reloads after 2 seconds
  - Logs sent to error tracking (if available)
- **Files**: Canvas3D.component.tsx

**P1-3: Add Family Config Validation on App Start**

- **Description**: Run `validateFamily()` on all families in development mode
- **Acceptance Criteria**:
  - Invalid `modelId` references logged as errors
  - Overlapping variant ranges logged as warnings
  - App starts successfully even with warnings
- **Files**: `src/config/families.registry.ts`

**P1-4: Optimize Cart Serialization**

- **Description**: Remove redundant variant metadata from cart extraData
- **Acceptance Criteria**:
  - Cart data size <200 bytes per item (down from 500)
  - Backend can reconstruct full config from `variantId`
- **Files**: functions.tsx

**P1-5: Add CI Model Validation Workflow**

- **Description**: GitHub Actions check for missing GLB files and size limits
- **Acceptance Criteria**:
  - CI fails if `modelPath` references non-existent file
  - Warning if GLB >1.5MB
  - Runs on every PR
- **Files**: `.github/workflows/validate-models.yml` (new)

### **P2 - Nice to Have**

**P2-1: Add GLB Cache Busting via Query Params**

- **Description**: Append version query param to model paths
- **Files**: `src/config/families/*.config.ts`, .env.local

**P2-2: Implement LRU Variant Cache (keep 2 most recent)**

- **Description**: Replace simple Map with LRU cache that disposes oldest variants
- **Files**: `src/utils/variantCache.ts`

**P2-3: Add Variant Switch Visual Feedback**

- **Description**: Subtle fade/pulse animation during variant change
- **Files**: ModelViewer.component.tsx

---

## 5. Risk Matrix

| Risk                                                            | Probability | Impact | Mitigation                                                                                           |
| --------------------------------------------------------------- | ----------- | ------ | ---------------------------------------------------------------------------------------------------- |
| **Memory leaks cause browser crashes**                          | High        | High   | P0-1: Implement disposal strategy, LRU cache. Load test with 100+ variant switches.                  |
| **Race conditions during rapid slider changes**                 | High        | Medium | P0-2: Add request ID tracking, debounce with concurrency guards. Integration tests with rapid input. |
| **GLB files missing/corrupted in production**                   | Medium      | High   | P1-5: CI validation checks. P0-5: Graceful fallback if preload fails. CDN monitoring alerts.         |
| **Variant constraints overlap causing unpredictable selection** | Low         | Medium | P1-3: Validation on app start, log warnings. Document tie-breaking rules clearly.                    |
| **WebGL context lost on low-memory devices**                    | Low         | High   | P1-2: Context lost handler with reload. Test on mobile devices with memory profiling.                |

---

## 6. Questions for Product/PO and Engineering

1. **Variant naming**: Should variant display names be stored in code (`FamilyVariant.displayName`) or fetched from WordPress (custom taxonomy)? Trade-off: code = type-safe, WP = business-team editable.

2. **Dimension gaps**: If family has gap [90-100cm], should UI visually disable that range (two separate sliders) or allow it with warning? What's better UX?

3. **Preload timeout**: If variant GLB takes >10 seconds to load (slow connection), should we timeout and show static image fallback? Or infinite wait?

4. **Order fulfillment**: Does factory/warehouse need specific data format for custom dimensions? Should we generate PDF spec sheet with 3D preview image?

5. **Pricing future-proofing**: Ignore for MVP per requirement, but confirm if formula-based pricing (volume × rate) is planned. Affects cart metadata design.

6. **Mobile testing**: Should we test GLB preloading on mobile (3G connection)? 3 variants × 1.5MB = 4.5MB. Acceptable?

7. **Variant switching frequency**: Analytics show users change dimensions how often? If rarely, we could load-on-demand instead of preload-all.

8. **Camera behavior preference**: When variant switches (small → large), should camera zoom out to fit larger model, or keep current framing (might crop)? User feedback needed.

9. **Error recovery**: If all variants fail to preload (network down), should we allow text-based configuration fallback or block checkout entirely?

10. **Model versioning**: When designer updates GLB file, how to coordinate deploy? Code references `cabinet.glb` but file updated on CDN. Need cache busting?

---

## 7. Appendix: PR Reviewer Checklist

### **Behavioral Checks**

- [ ] Depth dimension changes DO NOT trigger variant resolution (grep for `resolveVariantForDimensions` calls, verify depth excluded)
- [ ] Variant switch preserves user customizations (test: set color, switch variant, verify color applied to new model)
- [ ] Slider min/max spans full family range (test with cabinet family [60-180cm], verify slider bounds)
- [ ] Invalid dimensions block "Add to Cart" (test: manually set dimensions to gap value, verify button disabled)
- [ ] Camera presets recalculate after variant switch (test: switch variant, verify camera distance adjusts)

### **Performance Checks**

- [ ] Old model resources disposed after variant switch (Chrome DevTools → Memory → take heap snapshot, verify GLTF objects decrease)
- [ ] Preload completes in <8 seconds on 3G (Network throttling test)
- [ ] No memory leaks after 50 variant switches (heap size stable ±10MB)
- [ ] WebGL context lost handler triggers on memory exhaustion (force OOM, verify reload)

### **Code Quality**

- [ ] All async operations have error handling (`try/catch` or `.catch()`)
- [ ] Race conditions prevented (request ID tracking visible in code)
- [ ] Debug logs use `debug.log()` not `console.log()` (production-safe)
- [ ] TypeScript strict mode passes (`npm run type-check`)
- [ ] No `any` types in new variant resolution logic

### **Data Contracts**

- [ ] GraphQL query requests `familyId` field (verify in gql)
- [ ] Cart extraData includes `activeVariantId` and `familyId` (verify in serialize function)
- [ ] WordPress plugin exposes `familyId` in GraphQL schema (check resolver)
- [ ] Family configs validate on app start (see console for validation errors)

### **Edge Cases**

- [ ] Handle family with single variant (no switching, still preloads)
- [ ] Handle variant with no matching dimensions (clamps to nearest)
- [ ] Handle preload failure for 1 of 3 variants (shows toast, removes from options)
- [ ] Handle user navigating away mid-preload (cleanup registered)
- [ ] Handle rapid dimension changes (10 changes in 1 second, single final variant)

---

**END OF REVIEW**
