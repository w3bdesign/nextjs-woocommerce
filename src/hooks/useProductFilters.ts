import { useState } from 'react';
import { Product, ProductType } from '@/types/product';
import {
  getProductSortComparator,
  getUniqueProductTypes,
  isWithinPriceRange,
  matchesColor,
  matchesProductType,
  matchesSize,
} from '@/utils/functions/productUtils';

export const useProductFilters = (products: Product[]) => {
  const [sortBy, setSortBy] = useState('popular');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [productTypes, setProductTypes] = useState<ProductType[]>(() =>
    products ? getUniqueProductTypes(products) : [],
  );

  const toggleProductType = (id: string) => {
    setProductTypes((prev) =>
      prev.map((type) =>
        type.id === id ? { ...type, checked: !type.checked } : type,
      ),
    );
  };

  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange([0, 1000]);
    setProductTypes((prev) =>
      prev.map((type) => ({ ...type, checked: false })),
    );
  };

  const filterProducts = (products: Product[]) => {
    const filtered = (products || []).filter(
      (product: Product) =>
        isWithinPriceRange(product, priceRange) &&
        matchesProductType(product, productTypes) &&
        matchesSize(product, selectedSizes) &&
        matchesColor(product, selectedColors),
    );

    return filtered.toSorted(getProductSortComparator(sortBy));
  };

  return {
    sortBy,
    setSortBy,
    selectedSizes,
    setSelectedSizes,
    selectedColors,
    setSelectedColors,
    priceRange,
    setPriceRange,
    productTypes,
    toggleProductType,
    resetFilters,
    filterProducts,
  };
};
