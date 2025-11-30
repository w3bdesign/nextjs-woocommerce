import { Product, ProductType } from '@/types/product';
import {
  calculatePriceRange,
  extractNumericPrice,
  getUniqueProductTypes,
} from '@/utils/functions/productUtils';
import { useMemo, useState } from 'react';

export const useProductFilters = (products: Product[]) => {
  const [sortBy, setSortBy] = useState('popular');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Calculate initial price bounds from products
  const initialPriceBounds = useMemo(() => {
    const bounds = calculatePriceRange(products);
    return [bounds.min, bounds.max] as [number, number];
  }, [products]);

  const priceRangeConfig = useMemo(
    () => calculatePriceRange(products),
    [products],
  );

  const [priceRange, setPriceRange] =
    useState<[number, number]>(initialPriceBounds);
  const [productTypes, setProductTypes] = useState<ProductType[]>(() =>
    products ? getUniqueProductTypes(products) : [],
  );

  // Track if we're still calculating range (products loading)
  // Using 10000 as default max from DEFAULT_PRICE_BOUNDS
  const isCalculatingRange =
    !products || products.length === 0 || priceRangeConfig.max === 10000;

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
    setPriceRange(initialPriceBounds);
    setProductTypes((prev) =>
      prev.map((type) => ({ ...type, checked: false })),
    );
  };

  const filterProducts = (products: Product[]) => {
    const filtered = products?.filter((product: Product) => {
      // Filter by price
      const productPrice = extractNumericPrice(product.price);
      const withinPriceRange =
        productPrice >= priceRange[0] && productPrice <= priceRange[1];
      if (!withinPriceRange) return false;

      // Filter by product type
      const selectedTypes = productTypes
        .filter((t) => t.checked)
        .map((t) => t.name.toLowerCase());
      if (selectedTypes.length > 0) {
        const productCategories =
          product.productCategories?.nodes.map((cat) =>
            cat.name.toLowerCase(),
          ) || [];
        if (!selectedTypes.some((type) => productCategories.includes(type)))
          return false;
      }

      // Filter by size
      if (selectedSizes.length > 0) {
        const productSizes =
          product.attributes?.nodes.find(
            (attr) => attr.name.toLowerCase() === 'size',
          )?.options || [];
        if (!selectedSizes.some((size) => productSizes.includes(size)))
          return false;
      }

      // Filter by color
      if (selectedColors.length > 0) {
        const productColors =
          product.attributes?.nodes.find(
            (attr) => attr.name.toLowerCase() === 'color',
          )?.options || [];
        if (!selectedColors.some((color) => productColors.includes(color)))
          return false;
      }

      return true;
    });

    // Sort products
    return [...(filtered || [])].sort((a, b) => {
      const priceA = extractNumericPrice(a.price);
      const priceB = extractNumericPrice(b.price);

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'newest':
          return b.databaseId - a.databaseId;
        default: // 'popular'
          return 0;
      }
    });
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
    minPrice: priceRangeConfig.min,
    maxPrice: priceRangeConfig.max,
    priceStep: priceRangeConfig.step,
    isCalculatingRange,
  };
};
