# Testing Configurator with Mock Products

## ✅ Enabled for Testing

The **Mock Tee** product now has the 3D configurator enabled with the shoe model for testing purposes.

## 🧪 How to Test

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Mock Tee product:**
   - Go to: `http://localhost:3000/product/mock-tee`
   - Or click on "Mock Tee" from the products page

3. **You should see:**
   - 3D shoe model instead of product image
   - Interactive 3D viewer with rotation
   - Click on shoe parts to select them
   - Color picker appears when a part is selected
   - Colors update in real-time

## 📝 What Was Changed

In `src/utils/apollo/mockData.ts`, added:

```typescript
{
  name: 'Mock Tee',
  // ... other fields
  
  // Enable 3D configurator for testing
  configurator: {
    enabled: true,
    modelId: 'shoe-v1',
  },
}
```

## 🔄 To Disable the Configurator

Remove or set `enabled: false`:

```typescript
configurator: {
  enabled: false,  // This will show regular product image
  modelId: 'shoe-v1',
}
```

Or simply remove the `configurator` field entirely.

## 🎨 To Test with Different Models

Once you've added more models to the registry, you can test them:

```typescript
configurator: {
  enabled: true,
  modelId: 'sofa-modern-v1',  // Use any registered model ID
}
```

## 📊 Current Mock Products Setup

| Product | Configurator Status | Model |
|---------|---------------------|-------|
| Mock Hoodie | ❌ Disabled (shows image) | N/A |
| Mock Tee | ✅ Enabled | shoe-v1 |

## 🚀 To Enable for All Mock Products

If you want to test on multiple products, add the configurator field to each:

```typescript
export const mockProducts = [
  {
    name: 'Mock Hoodie',
    // ...
    configurator: {
      enabled: true,
      modelId: 'shoe-v1',
    },
  },
  {
    name: 'Mock Tee',
    // ...
    configurator: {
      enabled: true,
      modelId: 'shoe-v1',
    },
  },
];
```

## 🎯 Expected Behavior

### With `configurator.enabled: true`
- ✅ Shows 3D model viewer
- ✅ Interactive color customization
- ✅ Animation (rotation, bobbing)
- ✅ Click-to-select parts
- ✅ Color picker overlay

### With `configurator.enabled: false` or missing
- ✅ Shows regular product image
- ✅ Standard product page layout
- ✅ No 3D functionality

## 🐛 Troubleshooting

**Issue:** Configurator doesn't appear
- Check browser console for errors
- Verify `configurator.enabled` is `true`
- Verify `modelId` exists in `MODEL_REGISTRY`
- Clear browser cache and rebuild

**Issue:** Wrong model appears
- Check `modelId` matches registry key exactly
- Verify model file exists at specified path

**Issue:** Parts not clickable
- This is expected - the shoe model works fine
- When you add your own models, ensure node names match config
