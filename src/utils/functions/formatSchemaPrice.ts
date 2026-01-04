/**
 * Parse price string to float for schema.org using locale-aware formatting
 *
 * Handles multiple Polish price formats with Intl.NumberFormat:
 * - Simple: "800,00 zł" → "800.00"
 * - With thousand separator: "1.234,56 zł" → "1234.56"
 * - Already formatted: "800.00" → "800.00"
 *
 * @param priceString - Raw price string from WooCommerce
 * @param locale - BCP 47 locale string (default: 'pl-PL' for Polish)
 * @returns Normalized price string suitable for schema.org (numeric with period as decimal)
 * @example
 * formatSchemaPrice("800,00 zł") // returns "800.00"
 * formatSchemaPrice("1.234,56 zł") // returns "1234.56"
 */
export function formatSchemaPrice(
  priceString?: string,
  locale: string = 'pl-PL',
): string {
  if (!priceString) return '0';

  // Remove all non-numeric characters except comma and period
  const cleaned = priceString.replace(/[^\d.,]/g, '');

  // Handle Polish format: remove thousand separator (period), replace decimal (comma) with period
  // If both period and comma exist, period is thousand separator
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    return normalized;
  }

  // If only comma exists, it's the decimal separator
  if (cleaned.includes(',')) {
    return cleaned.replace(',', '.');
  }

  // Otherwise return as-is (already using period as decimal)
  return cleaned;
}

/**
 * Map WooCommerce stock status to schema.org availability URL
 *
 * Maps WooCommerce stock status values to their corresponding
 * schema.org Offer availability enumeration URLs.
 *
 * @param status - WooCommerce stock status ('IN_STOCK', 'OUT_OF_STOCK', 'ON_BACKORDER', etc.)
 * @returns Schema.org availability URL
 * @see https://schema.org/ItemAvailability
 * @example
 * mapStockStatusToSchema('IN_STOCK') // returns 'https://schema.org/InStock'
 * mapStockStatusToSchema('OUT_OF_STOCK') // returns 'https://schema.org/OutOfStock'
 * mapStockStatusToSchema('ON_BACKORDER') // returns 'https://schema.org/OutOfStock'
 */
export function mapStockStatusToSchema(status?: string): string {
  switch (status) {
    case 'IN_STOCK':
      return 'https://schema.org/InStock';
    case 'OUT_OF_STOCK':
      return 'https://schema.org/OutOfStock';
    case 'ON_BACKORDER':
      return 'https://schema.org/BackOrder';
    case 'PREORDER':
      return 'https://schema.org/PreOrder';
    default:
      return 'https://schema.org/OutOfStock';
  }
}
