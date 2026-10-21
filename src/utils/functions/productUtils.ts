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

/** Read price text only; this is not an HTML sanitizer and must not render HTML. */
const getPriceText = (price: string): string => {
  const characters: string[] = [];
  let skipUntil: '>' | ';' | null = null;

  for (const character of price) {
    if (skipUntil) {
      if (character === skipUntil) skipUntil = null;
    } else if (character === '<') {
      skipUntil = '>';
    } else if (character === '&') {
      skipUntil = ';';
    } else {
      characters.push(character);
    }
  }

  return characters.join('');
};

/** Parse WooCommerce display prices, including Norwegian decimal commas. */
export const parseProductPrice = (price: string | null | undefined): number => {
  // Ignore markup/entities before extracting digits (e.g. &#160; is not 160).
  const text = getPriceText(price ?? '');
  // For variable-product ranges, use the first (lowest) displayed price.
  const amount = /\d[\d\s.,]*/.exec(text)?.[0].replace(/\s/g, '');
  if (!amount) return Number.NaN;

  if (/^\d{1,3}([.,]\d{3})+$/.test(amount)) {
    return Number(amount.replace(/[.,]/g, ''));
  }

  const separator = Math.max(amount.lastIndexOf(','), amount.lastIndexOf('.'));
  if (separator === -1) return Number(amount);

  const whole = amount.slice(0, separator).replace(/[.,]/g, '');
  const fraction = amount.slice(separator + 1);
  return Number(`${whole}.${fraction}`);
};

/** Keep the slider usable for small catalogs without excluding expensive items. */
export const getMaxProductPrice = (products: Product[]): number =>
  products.reduce((max, product) => {
    const price = parseProductPrice(product.price);
    return Number.isFinite(price) ? Math.max(max, Math.ceil(price)) : max;
  }, 1000);

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
  const selectedTypes = productTypes.reduce<string[]>((acc, type) => {
    if (type.checked) {
      acc.push(type.name.toLowerCase());
    }
    return acc;
  }, []);

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
