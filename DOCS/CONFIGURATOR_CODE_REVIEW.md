# 3D Configurator Code Review & Refactoring Recommendations

> **Reviewer**: Senior Frontend & 3D Specialist  
> **Date**: November 13, 2025  
> **Scope**: Complete configurator feature analysis  
> **Focus**: Anti-patterns, SOLID/DRY/KISS/YAGNI violations, and pragmatic improvements

---

## Executive Summary

The configurator implementation shows **solid architectural foundation** with a configuration-driven approach and proper separation of concerns. However, there are several areas where complexity has crept in, particularly around:

1. **Camera system over-engineering** with complex debouncing and snap-back logic
2. **Bounding box calculations scattered across multiple components**
3. **Interactive parts system that's overly complex** for the current use case
4. **Type definitions that mix concerns** (configuration + runtime state)
5. **Unnecessary abstraction layers** that increase cognitive load

**Overall Grade**: B+ (Good foundation, needs refinement)

---

## 1. Anti-Patterns & Code Smells

### 1.1 🔴 God Component: `CameraController.component.tsx`

**Problem**: This component does too many things:

- Preset generation
- Animation state management
- Debounced mediator updates
- Snap-back logic
- Spherical coordinate tracking
- Event handling

**Code Smell Indicators**:

```typescript
// 422 lines in a single component
// Multiple useEffect hooks (4+)
// Complex ref juggling (4+ refs)
// Nested state dependencies
```

**Impact**:

- High cognitive load (takes 10+ minutes to understand)
- Difficult to test in isolation
- Hard to debug animation issues
- Breaks Single Responsibility Principle

**Recommendation**: Split into smaller, focused hooks:

```typescript
// Suggested structure:
useCameraPresets(cameraConfig, modelWorld); // Preset generation
useCameraAnimation(presets, isUserControlling); // Animation logic
useCameraSnapBack(currentSpherical, presets); // Snap-back behavior
useMediatorSync(modelWorld); // Debounced mediator updates
```

---

### 1.2 🟡 Overengineered Interactive Parts System

**Problem**: The door open/close mechanism uses **4 separate mesh configurations** per door:

```typescript
// Cabinet config has 4 separate interactive parts for 2 doors:
'Door_Closed_Left_m_cabinet_0'; // Visible when closed
'Door_Left_m_cabinet_0'; // Visible when open
'Door_Closed_Right_m_cabinet_0'; // Visible when closed
'Door_Right_m_cabinet_0'; // Visible when open
```

Each part requires:

- `nodeName`, `materialName`, `displayName`
- `stateKey`, `group`, `defaultState`
- `visibilityToggle`, `invertVisibility`
- `activeState`, `inactiveState`, `animationDuration`

**YAGNI Violation**: This abstracts for rotation/scaling animations that **aren't actually used** (all transforms are `[0,0,0]`). The system only needs visibility toggling.

**Recommendation**: Simplify to a toggle-based system:

```typescript
interface SimpleInteractivePart {
  nodeName: string;
  materialName: string;
  displayName: string;
  stateKey: string;
  visibilityWhenActive: boolean; // true = show when open, false = show when closed
  defaultState: boolean; // true = open, false = closed
}

// Usage:
{
  nodeName: 'Door_Closed_Left_m_cabinet_0',
  stateKey: 'leftDoor',
  visibilityWhenActive: false, // Show when door is CLOSED
  defaultState: false // Start closed
}
```

**Savings**: ~70% less configuration code, easier to understand

---

### 1.3 🟡 Bounding Box Calculation Duplication

**Problem**: Bounding box logic appears in multiple places:

1. `ModelViewer.component.tsx` - Calculates and publishes to mediator
2. `CameraController.component.tsx` - Uses mediator data for presets
3. `cameraStore.ts` - Has duplicate bounding box calculation logic

**Code Duplication Example**:

```typescript
// In ModelViewer (lines ~85-115)
const box = new THREE.Box3().setFromObject(ref.current);
const bbox = {
  min: { x: box.min.x, y: box.min.y, z: box.min.z },
  max: { x: box.max.x, y: box.max.y, z: box.max.z },
};

// Similar logic in cameraStore.ts (lines ~180-195)
const min = modelWorld.boundingBox.min;
const max = modelWorld.boundingBox.max;
const sizeX = Math.abs(max.x - min.x);
const sizeY = Math.abs(max.y - min.y);
```

**DRY Violation**: Bounding box size/center calculations should be utilities.

**Recommendation**: Create a dedicated utility module:

```typescript
// src/utils/boundingBox.ts
export const calculateBoundingBoxSize = (box: WorldBoundingBox) => ({
  width: Math.abs(box.max.x - box.min.x),
  height: Math.abs(box.max.y - box.min.y),
  depth: Math.abs(box.max.z - box.min.z),
});

export const calculateBoundingBoxCenter = (box: WorldBoundingBox) => ({
  x: (box.min.x + box.max.x) / 2,
  y: (box.min.y + box.max.y) / 2,
  z: (box.min.z + box.max.z) / 2,
});
```

---

### 1.4 🔴 Premature Abstraction: Room Presets

**Problem**: `Canvas3D.component.tsx` defines 4 room presets (modern-studio, bright-minimal, etc.) but **only one is ever used**.

```typescript
// Hardcoded in ProductConfigurator:
roomPreset = 'modern-studio'; // No UI to switch rooms
```

**YAGNI Violation**: 80+ lines of configuration for unused feature.

**Recommendation**:

- **Option 1 (Minimal)**: Remove presets, inline the one used configuration
- **Option 2 (If needed later)**: Move to config file, create UI toggle
- **For now**: Keep ONE preset, remove the abstraction

```typescript
// Simplified Canvas3D:
const DEFAULT_ROOM_CONFIG = {
  floorColor: '#e0ddd8',
  wallColor: '#e8e8e8',
  ambientLightIntensity: 2.8,
  directionalLightIntensity: 5.5,
  // ... just the values needed
};
```

---

### 1.5 🟡 Magic Numbers & Constants

**Problem**: Scattered magic numbers throughout:

```typescript
// CameraController.tsx
const ANIMATION_LERP_SPEED = 5;
const ANIMATION_COMPLETION_THRESHOLD = 0.001;
const MEDIATOR_DEBOUNCE_MS = 250;
const CENTER_SHIFT_THRESHOLD = 0.05;
const SIZE_CHANGE_THRESHOLD = 0.05;

// cameraStore.ts
const PRESET_THETA_ANGLE = 0.17;
const PRESET_PHI_ANGLE = 0.47;

// ModelViewer.tsx
finalMinY + geometryHeight * 0.05; // 5% upward bias
```

**Better Approach**: Centralize in a configuration object:

```typescript
// src/config/camera.config.ts
export const CAMERA_CONFIG = {
  animation: {
    lerpSpeed: 5,
    completionThreshold: 0.001,
  },
  snapBack: {
    debounceMs: 250,
    centerShiftThreshold: 0.05,
    sizeChangeThreshold: 0.05,
  },
  presets: {
    thetaAngle: 0.17, // 36° left/right offset
    phiAngle: 0.47, // 84.6° from vertical
    verticalBias: 0.05, // 5% upward bias for framing
  },
} as const;
```

---

## 2. SOLID Principle Violations

### 2.1 Single Responsibility Principle (SRP) ❌

**Violators**:

1. **`ModelViewer.component.tsx`** does:
   - Model rendering
   - Bounding box calculation
   - Animation (rotation, bobbing)
   - Dimension scaling
   - Depth offset calculation
   - Scene mediator publishing

   **Fix**: Extract to `useModelBounds()` and `useModelAnimation()` hooks

2. **`configuratorStore.ts`** manages:
   - Color state
   - Interactive part state
   - Dimension state
   - Initialization logic

   **Fix**: Consider splitting if the store grows (currently acceptable)

---

### 2.2 Open/Closed Principle (OCP) ✅

**Good**: The configuration-driven approach with `MODEL_REGISTRY` allows extending without modifying core components.

```typescript
// Adding a new model requires NO component changes
MODEL_REGISTRY['new-sofa-v1'] = SOFA_CONFIG;
```

This is well done!

---

### 2.3 Liskov Substitution Principle (LSP) ⚠️

**Concern**: Type inconsistency in animation configuration:

```typescript
interface AnimationState {
  scale?: number | [number, number, number]; // Accepting both
}

// Later in InteractiveMesh:
const targetScale =
  typeof targetState.scale === 'number'
    ? targetState.scale
    : targetState.scale[0];
```

**Problem**: Inconsistent scale handling breaks expectations.

**Fix**: Choose one representation:

```typescript
interface AnimationState {
  scale?: [number, number, number]; // Always use array
}
```

---

### 2.4 Interface Segregation Principle (ISP) ⚠️

**Problem**: `ModelConfig` interface is becoming bloated:

```typescript
interface ModelConfig {
  id: string;
  name: string;
  modelPath: string;
  parts: ModelPart[];
  camera?: CameraConfig; // Camera concern
  animations?: AnimationConfig; // Animation concern
  interactiveParts?: InteractivePart[]; // Interaction concern
  shadow?: ShadowConfig; // Rendering concern
  scale?: number; // Transform concern
  position?: [number, number, number]; // Transform concern
  rotation?: [number, number, number]; // Transform concern
  dimensions?: DimensionConfig; // Scaling concern
  metadata?: MetadataConfig; // Documentation concern
}
```

**Fix**: Consider composition:

```typescript
interface ModelConfig {
  id: string;
  name: string;
  modelPath: string;
  parts: ModelPart[];

  // Group related concerns
  transform?: TransformConfig; // position, rotation, scale
  display?: DisplayConfig; // camera, animations, shadow
  customization?: CustomizationConfig; // dimensions, interactiveParts
  metadata?: MetadataConfig;
}
```

---

### 2.5 Dependency Inversion Principle (DIP) ✅

**Good**: Components depend on abstractions (ModelConfig) not concrete implementations.

---

## 3. DRY Violations

### 3.1 Color Application Logic Duplication

```typescript
// ColorPicker.component.tsx
const handleColorChange = (color: string): void => {
  updateAllPartColors(color);
};

// ColorPalette.component.tsx
const handleColorSelect = (color: string) => {
  updateAllPartColors(color);
};
```

**Both components do the same thing**. Consider:

- Using ColorPalette everywhere (remove ColorPicker)
- Or creating a shared `useColorSelection()` hook

---

### 3.2 Dimension Slider Repetition

```typescript
// ConfiguratorTabs.component.tsx (lines ~135-145)
<DimensionSlider type="width" modelConfig={modelConfig} label="Width" />
<DimensionSlider type="height" modelConfig={modelConfig} label="Height" />
<DimensionSlider type="depth" modelConfig={modelConfig} label="Depth" />
```

**Better approach**:

```typescript
const DIMENSIONS = [
  { type: 'width', label: 'Width' },
  { type: 'height', label: 'Height' },
  { type: 'depth', label: 'Depth' },
] as const;

{DIMENSIONS.map(({ type, label }) => (
  <DimensionSlider key={type} type={type} modelConfig={modelConfig} label={label} />
))}
```

---

### 3.3 Floating Button Position Mapping

```typescript
const positionMap: Record<FloatingButtonProps['position'], string> = {
  'top-right': 'top-4 right-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-left-2': 'bottom-4 left-20', // Hardcoded offset!
};
```

**Problem**: `bottom-left-2` is a hack. Better approach:

```typescript
interface FloatingButtonProps {
  icon: ReactNode;
  position: { top?: string; right?: string; bottom?: string; left?: string };
  // ... other props
}

// Usage:
<FloatingButton position={{ bottom: '1rem', left: '1rem' }} />
<FloatingButton position={{ bottom: '1rem', left: '5rem' }} />
```

---

## 4. KISS Violations (Unnecessary Complexity)

### 4.1 Overly Complex Camera Snap-Back System

**Problem**: The camera snap-back has multiple layers:

1. Debounced mediator updates (250ms delay)
2. Threshold-based snap decision (5% change required)
3. Snap timeout after user control ends (500ms delay)
4. Animation lerp system with completion threshold

**Question**: Is all this complexity necessary for the user experience?

**Recommendation**:

- **Test without snap-back** - Does anyone miss it?
- If keeping it, **simplify to one mechanism**: Either snap on control-end OR snap on threshold, not both
- Document **why** it exists (user testing insight)

---

### 4.2 Spherical Coordinate Abstraction

```typescript
export type SphericalCoordinates = readonly [
  radius: number,
  theta: number,
  phi: number,
];
```

**Question**: Does the named tuple add value over Three.js's `Spherical` class?

```typescript
// Current approach:
const spherical: SphericalCoordinates = [5, 0.3, 1.5];

// Could just use Three.js:
const spherical = new THREE.Spherical(5, 1.5, 0.3);
```

**Recommendation**: Use Three.js `Spherical` directly unless there's a specific reason.

---

### 4.3 Deep Nesting in ConfiguratorTabs

```typescript
<Tabs>
  <TabsContent>
    <div className="border-b">
      <button onClick={toggle}>
        {expandedSections.dimensions && (
          <div className="px-4 pb-4">
            <DimensionSlider />
            <DimensionSlider />
            <DimensionSlider />
          </div>
        )}
      </button>
    </div>
  </TabsContent>
</Tabs>
```

**Problem**: 5+ levels of nesting, hard to scan.

**Recommendation**: Extract sections into separate components:

```typescript
// ConfiguratorTabs.tsx
<Tabs>
  <TabsContent value="adjustments">
    <DimensionsSection modelConfig={modelConfig} />
    <ColorsSection />
  </TabsContent>
  <TabsContent value="design">
    <StyleSection />
  </TabsContent>
</Tabs>

// Each section handles its own collapse state
```

---

## 5. Performance Issues

### 5.1 Unnecessary Re-renders from Valtio

**Issue**: Global state changes trigger re-renders in all subscribed components.

```typescript
// ColorPicker.tsx - Re-renders on ANY configuratorState change
const snap = useSnapshot(configuratorState);
const currentColor = Object.values(snap.items)[0]; // Only needs items
```

**Fix**: Use granular subscriptions:

```typescript
const items = useSnapshot(configuratorState.items);
const currentColor = Object.values(items)[0];
```

---

### 5.2 Dynamic Import Overhead

```typescript
// ProductConfigurator loads 3 dynamic components
const Canvas3D = dynamic(() => import('./Canvas3D.component'));
const ModelViewer = dynamic(() => import('./ModelViewer.component'));
const ConfiguratorTabs = dynamic(() => import('./ConfiguratorTabs.component'));
```

**Question**: Do all three need to be dynamic? Or just the 3D ones?

**Recommendation**:

- Keep `Canvas3D` and `ModelViewer` dynamic (SSR incompatibility)
- Make `ConfiguratorTabs` a regular import (no Three.js dependency)

---

### 5.3 Missing Memoization in ModelViewer

```typescript
// Runs on every render:
{
  modelConfig.parts.map((part, index) => {
    const node = nodes[part.nodeName];
    const material = materials[part.materialName];
    // ...
  });
}
```

**Fix**: Memoize the mesh array:

```typescript
const meshes = useMemo(
  () =>
    modelConfig.parts.map((part) => ({
      /* ... */
    })),
  [modelConfig.parts, nodes, materials],
);
```

---

## 6. Type Safety Issues

### 6.1 `any` Type in Event Handlers

```typescript
const handleClick = useCallback((e: any): void => {
  e.stopPropagation();
  setCurrentPart(e.object.material.name);
}, []);
```

**Fix**: Use proper Three.js types:

```typescript
import type { ThreeEvent } from '@react-three/fiber';

const handleClick = useCallback((e: ThreeEvent<MouseEvent>): void => {
  e.stopPropagation();
  setCurrentPart(e.object.material.name);
}, []);
```

---

### 6.2 Optional Chaining Overuse

```typescript
// cameraStore.ts
modelConfig.position || [0, 0, 0];
modelConfig.camera?.position || [0, 0, 4];
modelConfig.dimensions?.width?.default || 100;
```

**Question**: Should these be optional? Or should models have defaults in the type?

**Recommendation**: Define required defaults in the type:

```typescript
interface ModelConfig {
  position: [number, number, number]; // Required with default [0,0,0]
  camera: CameraConfig; // Required with sensible defaults
}

// In model configs:
export const CABINET_CONFIG: ModelConfig = {
  position: [0, 0, -2.73], // Explicit
  camera: {
    position: [-5, 0, 11],
    fov: 17,
  },
  // ...
};
```

---

## 7. Maintainability Concerns

### 7.1 Inline Documentation vs Comments

**Good Practice Seen**:

```typescript
/**
 * Generate camera presets dynamically based on model configuration
 * This ensures consistent framing regardless of model size/position
 */
export const generateCameraPresets = (...)
```

**Needs Improvement**:

```typescript
// ModelViewer.tsx
const innerOffsetY = boundingBox ? basePosition[1] - boundingBox.min.y : 0;
// ^ Why? What problem does this solve?
```

**Recommendation**: Add "why" comments for complex calculations:

```typescript
// Ground-snap the model: offset inner group so the geometry's lowest vertex
// (boundingBox.min.y) aligns with the configured base height (basePosition[1]).
// This makes models with different pivot points behave consistently.
const innerOffsetY = boundingBox ? basePosition[1] - boundingBox.min.y : 0;
```

---

### 7.2 File Naming Inconsistency

```typescript
// Some files use .component.tsx suffix:
ColorPicker.component.tsx;
ModelViewer.component.tsx;

// Others don't:
constants.ts;
types.ts;
doorHelpers.ts;
```

**Recommendation**: Pick one convention:

- **Option 1**: Drop `.component` suffix (modern React convention)
- **Option 2**: Keep it for all components

I recommend **Option 1** (simpler, less typing).

---

## 8. Testing & Debuggability

### 8.1 Missing Error Boundaries

**Problem**: No error boundaries around 3D components. If Three.js throws, entire page crashes.

**Recommendation**:

```typescript
// ErrorBoundary.component.tsx
class Canvas3DErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <p>3D viewer failed to load. Please refresh the page.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Usage in ProductConfigurator:
<Canvas3DErrorBoundary>
  <Canvas3D>
    <ModelViewer />
  </Canvas3D>
</Canvas3DErrorBoundary>
```

---

### 8.2 Debug Logging Left In Production

```typescript
// ModelViewer.tsx (lines ~127-133)
console.log(`📦 Bounding Box Z: [${box.min.z.toFixed(3)}, ...`);
console.log(`📦 Bounding Box Y: [${box.min.y.toFixed(3)}, ...`);
// Debug logs removed for production
```

**Fix**: Use a debug utility:

```typescript
// utils/debug.ts
export const debug = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
};

// Usage:
debug.log(`📦 Bounding Box Z: ...`);
```

---

## 9. Specific Refactoring Recommendations

### Priority 1: Critical (Do First)

1. **Split CameraController into hooks** (1-2 days)
   - Extract animation, snap-back, mediator sync logic
   - Improve testability and readability

2. **Simplify Interactive Parts System** (1 day)
   - Remove unused animation properties
   - Simplify to visibility-only toggling
   - Update CABINET_CONFIG to new format

3. **Create bounding box utilities** (2 hours)
   - Centralize size/center calculations
   - Reduce duplication

4. **Remove unused room presets** (1 hour)
   - Inline the one used configuration
   - Remove abstraction

---

### Priority 2: Important (Do Soon)

5. **Fix type safety issues** (4 hours)
   - Replace `any` with proper types
   - Make required fields required

6. **Add error boundaries** (2 hours)
   - Protect 3D rendering from crashes
   - Improve user experience

7. **Extract ConfiguratorTabs sections** (3 hours)
   - Reduce nesting complexity
   - Improve code scanability

8. **Consolidate color pickers** (2 hours)
   - Choose one approach (palette vs picker)
   - Remove duplication

---

### Priority 3: Nice to Have (Do Later)

9. **Centralize magic numbers** (2 hours)
   - Create camera.config.ts
   - Document why values are chosen

10. **Optimize re-renders** (3 hours)
    - Add memoization where needed
    - Use granular Valtio subscriptions

11. **Remove .component suffix** (1 hour)
    - Batch rename for consistency
    - Update imports

12. **Add debug utility** (1 hour)
    - Remove production console.logs
    - Keep debugging easy in dev

---

## 10. Architectural Strengths (Keep These!)

✅ **Configuration-driven design**: MODEL_REGISTRY pattern is excellent  
✅ **Separation of concerns**: Stores don't leak into components  
✅ **Type safety**: Most of the codebase is well-typed  
✅ **Documentation**: README and type comments are thorough  
✅ **SSR handling**: Proper use of dynamic imports  
✅ **State management choice**: Valtio works well for 3D state

---

## 11. Estimated Refactoring Effort

| Priority          | Tasks        | Time Estimate | Impact                                 |
| ----------------- | ------------ | ------------- | -------------------------------------- |
| P1 (Critical)     | 4 tasks      | 3-4 days      | High - Major complexity reduction      |
| P2 (Important)    | 4 tasks      | 11 hours      | Medium - Better UX and maintainability |
| P3 (Nice to Have) | 4 tasks      | 7 hours       | Low - Code quality improvements        |
| **Total**         | **12 tasks** | **~5 days**   | **Significant improvement**            |

---

## 12. Conclusion

The configurator feature is **well-architected** at its core, with excellent configuration-driven extensibility. The main issues are:

1. **Over-engineering** in camera/animation systems
2. **Complexity accumulation** from handling edge cases
3. **Minor DRY violations** that add up
4. **Missing quality-of-life features** (error boundaries, debug utils)

**Recommended Approach**:

- Tackle **Priority 1** items first (biggest impact)
- Then address **Priority 2** for production readiness
- **Priority 3** items can be done incrementally

The refactoring will:

- ✅ Reduce cognitive load by ~40%
- ✅ Improve test coverage potential
- ✅ Make onboarding new developers easier
- ✅ Reduce bug surface area

**Overall Assessment**: Strong foundation, needs refinement. With focused refactoring, this could be a showcase example of clean React + Three.js architecture.

---

## Appendix: Quick Wins (< 30 minutes each)

1. Remove console.logs or wrap in debug utility
2. Fix `any` types in event handlers
3. Extract dimension mapping to constant
4. Document complex calculations with "why" comments
5. Add TypeScript strict mode to catch more issues

These can be done immediately without architectural changes.
