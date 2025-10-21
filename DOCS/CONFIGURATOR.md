# 3D Configurator Documentation

## 📖 Main Documentation

**For complete configurator documentation, see:**

### 👉 **[../src/components/Configurator/README.md](../src/components/Configurator/README.md)**

This comprehensive guide includes:

- ✅ **Overview** - What the configurator does
- ✅ **Quick Start** - Get up and running in minutes
- ✅ **Adding New Models** - Step-by-step guide (5 minutes)
- ✅ **Configuration** - All config options explained
- ✅ **Component API** - Props and usage
- ✅ **Testing** - Testing procedures and checklist
- ✅ **Troubleshooting** - Common issues and solutions
- ✅ **Performance** - Optimization tips
- ✅ **Deployment** - Production deployment guide

---

## 🗂️ Quick Links

### For Developers

- **Adding a new model?** → [README.md - Adding New Models](../src/components/Configurator/README.md#adding-new-models)
- **Configuration options?** → [README.md - Configuration](../src/components/Configurator/README.md#configuration)
- **Component API?** → [README.md - Component API](../src/components/Configurator/README.md#component-api)
- **Having issues?** → [README.md - Troubleshooting](../src/components/Configurator/README.md#troubleshooting)

### For Reference

- **Type Definitions** → `src/types/configurator.ts`
- **Model Registry** → `src/config/models.registry.ts`
- **Example Config** → `src/config/shoeModel.config.ts`
- **Store Logic** → `src/stores/configuratorStore.ts`

---

## 📦 Archived Documentation

Old documentation from before the October 2025 refactoring is archived in:

- [_archive/](\_archive/) - Historical docs (outdated, kept for reference)

---

## 🚀 Quick Example

Want to add a new 3D model? It's simple:

```typescript
// 1. Create config file (src/config/yourModel.config.ts)
export const YOUR_CONFIG: ModelConfig = {
  id: 'your-model-v1',
  modelPath: '/models/your-model.glb',
  parts: [
    { nodeName: 'part1', materialName: 'material1', displayName: 'Part 1', defaultColor: '#ffffff' }
  ]
};

// 2. Register it (src/config/models.registry.ts)
MODEL_REGISTRY['your-model-v1'] = YOUR_CONFIG;

// 3. Use it
<ProductConfigurator modelId="your-model-v1" />
```

**That's it!** No component changes needed. ✅

For detailed instructions, see the [main README](../src/components/Configurator/README.md#adding-new-models).

---

**Last Updated:** October 21, 2025  
**Version:** 2.0 (Configuration-driven)
