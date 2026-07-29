import { Product, ProductCategory, ProductType } from '@/types/product';

export const getUniqueProductTypes = (products: Product[]): ProductType[] => {
  // Use Map to ensure unique categories by slug
  const categoryMap = new Map<string, ProductType>();

  products?.forEach((product) => {
    product.productCategories?.nodes.forEach((cat: ProductCategory) => {
      if (!categoryMap.has(cat.slug)) {
        categoryMap.set(cat.slug, {
          id: cat.slug,
          name: cat.name,
          checked: false,
        });
      }
    });
  });

  // Convert Map values to array and sort by name
  return Array.from(categoryMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
};

/** Parse a price string into a numeric value */
export const parseProductPrice = (price: string): number =>
  Number.parseFloat(price.replace(/[^0-9.]/g, ''));

/** Check if a product's price falls within the given range */
export const isWithinPriceRange = (
  product: Product,
  priceRange: [number, number],
): boolean => {
  const productPrice = parseProductPrice(product.price);
  return productPrice >= priceRange[0] && productPrice <= priceRange[1];
};

/** Check if a product matches any of the selected product types (categories) */
export const matchesProductType = (
  product: Product,
  productTypes: ProductType[],
): boolean => {
  const selectedTypes = productTypes
    .filter((type) => type.checked)
    .map((type) => type.name.toLowerCase());

  if (selectedTypes.length === 0) return true;

  const productCategorySet = new Set(
    product.productCategories?.nodes.map((cat) => cat.name.toLowerCase()) || [],
  );
  return selectedTypes.some((type) => productCategorySet.has(type));
};

/** Check if a product matches any of the selected sizes */
export const matchesSize = (
  product: Product,
  selectedSizes: string[],
): boolean => {
  if (selectedSizes.length === 0) return true;

  const productSizeSet = new Set(
    product.allPaSizes?.nodes.map((node) => node.name) || [],
  );
  return selectedSizes.some((size) => productSizeSet.has(size));
};

/** Check if a product matches any of the selected colors */
export const matchesColor = (
  product: Product,
  selectedColors: string[],
): boolean => {
  if (selectedColors.length === 0) return true;

  const productColorSet = new Set(
    product.allPaColors?.nodes.map((node) => node.name) || [],
  );
  return selectedColors.some((color) => productColorSet.has(color));
};

/** Sort comparator for products based on sort criteria */
export const getProductSortComparator = (
  sortBy: string,
): ((a: Product, b: Product) => number) => {
  switch (sortBy) {
    case 'price-low':
      return (a, b) => parseProductPrice(a.price) - parseProductPrice(b.price);
    case 'price-high':
      return (a, b) => parseProductPrice(b.price) - parseProductPrice(a.price);
    case 'newest':
      return (a, b) => b.databaseId - a.databaseId;
    default:
      return () => 0;
  }
};
