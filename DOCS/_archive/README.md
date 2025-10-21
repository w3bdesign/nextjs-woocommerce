# Archived Documentation

This folder contains **outdated** configurator documentation from before the October 2025 refactoring.

## ⚠️ These Documents Are Outdated

The following files describe the **old hardcoded implementation** and are kept for historical reference only:

- `3D_CONFIGURATOR_README.md` - Original POC documentation (outdated)
- `3D_CONFIGURATOR_ARCHITECTURE.md` - Original architecture decisions (partially outdated)
- `CONFIGURATOR_REFACTORING_SUMMARY.md` - Refactoring summary (historical)
- `TESTING_CONFIGURATOR_MOCK_PRODUCTS.md` - Testing guide (now in main README)
- `ADD_NEW_MODEL_GUIDE.md` - Quick guide (now in main README)

## 📖 Current Documentation

**For up-to-date information, see:**

### 👉 **[src/components/Configurator/README.md](../src/components/Configurator/README.md)**

The current README contains:
- Complete feature overview
- Step-by-step guides for adding models
- Configuration reference
- Testing procedures
- Troubleshooting
- All the latest information

---

## What Changed?

### Before (Hardcoded) - Described in These Archived Docs
- ❌ Shoe model hardcoded in components
- ❌ Required code changes for new models
- ❌ 8 parts hardcoded in JSX
- ❌ Showed on ALL product pages
- ❌ ~4 hours to add new model

### After (Configuration-Driven) - See Current README
- ✅ Any model supported via config files
- ✅ No code changes needed for new models
- ✅ Dynamic part rendering
- ✅ Per-product control via metadata
- ✅ ~5 minutes to add new model

---

**Date Archived:** October 21, 2025  
**Reason:** Refactored to configuration-driven architecture
