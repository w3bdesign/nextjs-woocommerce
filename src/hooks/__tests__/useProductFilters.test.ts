import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useProductFilters } from '@/hooks/useProductFilters';
import type { Product } from '@/types/product';

describe('useProductFilters', () => {
  it('starts with default filters', () => {
    const { result } = renderHook(() => useProductFilters([]));
    expect(result.current.sortBy).toBe('popular');
    expect(result.current.priceRange).toEqual([0, 1000]);
    expect(result.current.selectedSizes).toEqual([]);
    expect(result.current.selectedColors).toEqual([]);
  });

  it('handles a missing product list', () => {
    const missing = undefined as unknown as Product[];
    const { result } = renderHook(() => useProductFilters(missing));

    expect(result.current.productTypes).toEqual([]);
    expect(result.current.filterProducts(missing)).toEqual([]);
  });
});
