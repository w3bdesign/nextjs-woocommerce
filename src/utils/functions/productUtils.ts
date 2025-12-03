import { Product, ProductCategory, ProductType } from '@/types/product';

/**
 * Default price range bounds used as fallback when no products available
 */
export const DEFAULT_PRICE_BOUNDS = {
  min: 0,
  max: 10000,
  step: 100,
} as const;

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

/**
 * Decode HTML entities from WooCommerce/WordPress strings
 * Handles common entities like &nbsp;, &amp;, &lt;, &gt;, &quot;, etc.
 * Uses consistent server-side compatible approach to prevent hydration mismatches
 * @param str - String potentially containing HTML entities
 * @returns Decoded string
 */
export const decodeHtmlEntities = (str: string | null | undefined): string => {
  if (!str || typeof str !== 'string') return '';

  // Always use server-side compatible decoding to prevent hydration mismatches
  // DO NOT use document.createElement as it produces different results on server vs client
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&hellip;/gi, '...')
    .replace(/&ndash;/gi, '-')
    .replace(/&mdash;/gi, '-')
    .replace(/&euro;/gi, '€')
    .replace(/&pound;/gi, '£')
    .replace(/&yen;/gi, '¥')
    .replace(/&cent;/gi, '¢')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
};

/**
 * Extract numeric price value from price string
 * Properly handles various currency formats used in WooCommerce
 *
 * @param priceString - Price string like "$4999.00", "kr 4999", "4999 PLN", "kr198.00 - kr299.00"
 * @returns Numeric price value or 0 if invalid
 *
 * @example
 * extractNumericPrice("$4,999.00") // Returns: 4999
 * extractNumericPrice("1.234,56 €") // Returns: 1234.56 (European format)
 * extractNumericPrice("kr198.00 - kr299.00") // Returns: 198 (takes first in range)
 * extractNumericPrice("800,00&nbsp;zł") // Returns: 800 (decodes HTML entities)
 * extractNumericPrice("PLN 1234.56") // Returns: 1234.56
 */
export const extractNumericPrice = (priceString: string): number => {
  if (!priceString || typeof priceString !== 'string') return 0;

  // Decode HTML entities first (e.g., &nbsp; to space)
  const decodedString = decodeHtmlEntities(priceString);

  // Handle range prices like "$299.00 - kr349.00" or "kr198.00 - kr299.00"
  // Take the first price in the range
  let cleanString = decodedString;
  if (cleanString.includes(' - ')) {
    cleanString = cleanString.split(' - ')[0].trim();
  }

  // Remove all currency symbols and letters, keep only digits, comma, and decimal point
  // This handles: $, kr, PLN, €, £, etc.
  let numericString = cleanString.replace(/[^\d.,]/g, '');

  // Handle European format (1.234,56) vs US format (1,234.56)
  // Count commas and periods to determine format
  const commaCount = (numericString.match(/,/g) || []).length;
  const periodCount = (numericString.match(/\./g) || []).length;

  if (commaCount > 0 && periodCount > 0) {
    // Both present - determine which is decimal separator
    const lastComma = numericString.lastIndexOf(',');
    const lastPeriod = numericString.lastIndexOf('.');

    if (lastComma > lastPeriod) {
      // European format: 1.234,56
      numericString = numericString.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,234.56
      numericString = numericString.replace(/,/g, '');
    }
  } else if (commaCount > 0) {
    // Only commas - could be European decimal or thousands separator
    // If there's only one comma and it has 2 digits after, it's likely decimal
    if (commaCount === 1 && numericString.split(',')[1]?.length === 2) {
      // European decimal: 1234,56
      numericString = numericString.replace(',', '.');
    } else {
      // Thousands separator: 1,234
      numericString = numericString.replace(/,/g, '');
    }
  }
  // If only periods, assume US format and remove thousands separators except last
  else if (periodCount > 1) {
    const parts = numericString.split('.');
    const lastPart = parts.pop();
    numericString = parts.join('') + '.' + lastPart;
  }

  const numericValue = parseFloat(numericString);

  return isNaN(numericValue) ? 0 : numericValue;
};

/**
 * Extract currency symbol from price string
 * Handles various WooCommerce price formats and normalizes PLN to zł
 *
 * @param priceString - Price string like "800,00 zł", "PLN 1234", "kr 4999"
 * @returns Currency symbol or empty string if not detected
 *
 * @example
 * extractCurrencySymbol("800,00 zł") // Returns: "zł"
 * extractCurrencySymbol("PLN 1234.56") // Returns: "zł"
 * extractCurrencySymbol("kr 4999") // Returns: "kr"
 * extractCurrencySymbol("1234") // Returns: ""
 */
export const extractCurrencySymbol = (priceString: string): string => {
  if (!priceString || typeof priceString !== 'string') return '';

  // Decode HTML entities first
  const decodedString = decodeHtmlEntities(priceString);

  // Handle range prices - take first price
  const cleanString = decodedString.includes(' - ')
    ? decodedString.split(' - ')[0].trim()
    : decodedString;

  // Remove all digits, spaces, commas, periods, and common separators
  // Keep only currency symbols and letters
  const currencyMatch = cleanString.replace(/[\d\s,.-]+/g, '').trim();

  if (!currencyMatch) return '';

  // Normalize PLN variations to zł
  const normalized = currencyMatch.toUpperCase();
  if (normalized === 'PLN' || normalized === 'PL') {
    return 'zł';
  }

  // Return the extracted currency symbol
  return currencyMatch;
};

/**
 * Calculate dynamic price range bounds from product array
 * Returns smart defaults when no products available
 *
 * @param products - Array of products to analyze
 * @returns Object with min, max, and step values for price filtering
 *
 * @example
 * calculatePriceRange([
 *   { price: "$299.00" },
 *   { price: "$12999.00" }
 * ]) // Returns: { min: 299, max: 12999, step: 129 }
 *
 * calculatePriceRange([]) // Returns: { min: 0, max: 10000, step: 100 }
 */
export const calculatePriceRange = (
  products: Product[],
): { min: number; max: number; step: number } => {
  // Handle empty or invalid products array
  if (!products || products.length === 0) {
    return DEFAULT_PRICE_BOUNDS;
  }

  // Extract all numeric prices from products
  const prices = products
    .map((product) => extractNumericPrice(product.price))
    .filter((price) => price > 0);

  // If no valid prices found, return defaults
  if (prices.length === 0) {
    return DEFAULT_PRICE_BOUNDS;
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Calculate a reasonable step size (1% of max price, minimum 10)
  const step = Math.max(10, Math.ceil(maxPrice / 100));

  return {
    min: Math.floor(minPrice),
    max: Math.ceil(maxPrice),
    step,
  };
};
