/**
 * Variant Cache with LRU Disposal Strategy
 *
 * Manages preloaded 3D model variants with automatic resource disposal
 * to prevent GPU memory leaks. Implements Least Recently Used (LRU)
 * eviction policy to keep only the most recently accessed variants in memory.
 *
 * Memory Management:
 * - Keeps up to 2 variants in memory (current + previous for instant back-switching)
 * - Disposes Three.js resources (geometries, materials, textures) when evicting
 * - Prevents WebGL context loss on low-memory devices
 *
 * Usage:
 * - Call set() when preloading a new variant
 * - Call get() when switching to a variant (updates LRU timestamp)
 * - Disposal happens automatically when cache exceeds maxSize
 */

import { debug } from '@/utils/debug';
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

interface CacheEntry {
  gltf: GLTF;
  lastAccess: number;
}

/**
 * LRU cache for 3D model variants with automatic Three.js resource disposal.
 *
 * Maintains up to `maxSize` variants in memory. When capacity is exceeded,
 * the least recently accessed variant is disposed and removed from cache.
 */
export class VariantCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;

  constructor(maxSize: number = 2) {
    this.maxSize = maxSize;
  }

  /**
   * Stores a GLTF variant in cache. If cache is at capacity, disposes
   * the least recently used variant before adding the new one.
   *
   * @param variantId - Unique identifier for the variant
   * @param gltf - The loaded GLTF object
   */
  set(variantId: string, gltf: GLTF): void {
    // If variant already cached, update timestamp only
    if (this.cache.has(variantId)) {
      const entry = this.cache.get(variantId)!;
      entry.lastAccess = Date.now();
      return;
    }

    // If at capacity, dispose oldest variant
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    // Add new variant to cache
    this.cache.set(variantId, {
      gltf,
      lastAccess: Date.now(),
    });

    if (process.env.NODE_ENV === 'development') {
      debug.log(
        `[VariantCache] Cached variant: ${variantId} (size: ${this.cache.size}/${this.maxSize})`,
      );
    }
  }

  /**
   * Retrieves a variant from cache and updates its last access timestamp.
   *
   * @param variantId - Unique identifier for the variant
   * @returns The GLTF object if found, undefined otherwise
   */
  get(variantId: string): GLTF | undefined {
    const entry = this.cache.get(variantId);

    if (entry) {
      // Update LRU timestamp
      entry.lastAccess = Date.now();
      return entry.gltf;
    }

    return undefined;
  }

  /**
   * Checks if a variant exists in cache without updating LRU timestamp.
   *
   * @param variantId - Unique identifier for the variant
   * @returns True if variant is cached, false otherwise
   */
  has(variantId: string): boolean {
    return this.cache.has(variantId);
  }

  /**
   * Manually disposes a specific variant and removes it from cache.
   *
   * @param variantId - Unique identifier for the variant to dispose
   */
  dispose(variantId: string): void {
    const entry = this.cache.get(variantId);

    if (entry) {
      this.disposeGLTF(entry.gltf, variantId);
      this.cache.delete(variantId);
    }
  }

  /**
   * Clears the entire cache and disposes all variants.
   * Call this when user navigates away or on WebGL context lost.
   */
  clear(): void {
    this.cache.forEach((entry, variantId) => {
      this.disposeGLTF(entry.gltf, variantId);
    });

    this.cache.clear();

    if (process.env.NODE_ENV === 'development') {
      debug.log('[VariantCache] Cleared all cached variants');
    }
  }

  /**
   * Finds and evicts the least recently used variant from cache.
   * @private
   */
  private evictOldest(): void {
    let oldestVariantId: string | null = null;
    let oldestTimestamp = Infinity;

    // Find LRU variant
    this.cache.forEach((entry, variantId) => {
      if (entry.lastAccess < oldestTimestamp) {
        oldestTimestamp = entry.lastAccess;
        oldestVariantId = variantId;
      }
    });

    // Dispose and remove
    if (oldestVariantId) {
      this.dispose(oldestVariantId);

      if (process.env.NODE_ENV === 'development') {
        debug.log(`[VariantCache] Evicted oldest variant: ${oldestVariantId}`);
      }
    }
  }

  /**
   * Disposes all Three.js resources in a GLTF object to prevent memory leaks.
   * Traverses scene graph and disposes geometries, materials, and textures.
   *
   * @private
   * @param gltf - The GLTF object to dispose
   * @param variantId - Variant ID for logging purposes
   */
  private disposeGLTF(gltf: GLTF, variantId: string): void {
    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        // Dispose geometry
        if (object.geometry) {
          object.geometry.dispose();
        }

        // Dispose material(s)
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) =>
              this.disposeMaterial(material),
            );
          } else {
            this.disposeMaterial(object.material);
          }
        }
      }
    });

    if (process.env.NODE_ENV === 'development') {
      debug.log(
        `[VariantCache] Disposed Three.js resources for variant: ${variantId}`,
      );
    }
  }

  /**
   * Disposes a Three.js material and all its textures.
   *
   * @private
   * @param material - The material to dispose
   */
  private disposeMaterial(material: THREE.Material): void {
    // Dispose all texture properties
    const textureProperties = [
      'map',
      'normalMap',
      'roughnessMap',
      'metalnessMap',
      'alphaMap',
      'emissiveMap',
      'bumpMap',
      'displacementMap',
      'lightMap',
      'aoMap',
    ] as const;

    textureProperties.forEach((prop) => {
      const texture = (material as any)[prop];
      if (texture && texture instanceof THREE.Texture) {
        texture.dispose();
      }
    });

    // Dispose the material itself
    material.dispose();
  }

  /**
   * Returns current cache size for monitoring/debugging.
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Returns maximum cache capacity.
   */
  get capacity(): number {
    return this.maxSize;
  }
}

/**
 * Singleton instance for use across the application.
 * Import this to access the shared variant cache.
 *
 * @example
 * import { variantCache } from '@/utils/variantCache';
 *
 * variantCache.set('cabinet-small', gltf);
 * const cached = variantCache.get('cabinet-small');
 */
export const variantCache = new VariantCache(2);
