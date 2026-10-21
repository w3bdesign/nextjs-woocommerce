type Price = string | number | null | undefined;

// Store-wide display policy: Norwegian kroner, decimal commas and two decimals.
const priceFormatter = new Intl.NumberFormat('nb-NO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Extract price text without rendering HTML or interpreting entity digits as money. */
const getPriceText = (price: string): string => {
  const characters: string[] = [];
  let skipUntil: '>' | ';' | null = null;

  for (const character of price.replace(
    /&(?:ndash|mdash|#8211|#8212);/gi,
    '-',
  )) {
    if (skipUntil) {
      if (character === skipUntil) skipUntil = null;
    } else if (character === '<') {
      skipUntil = '>';
    } else if (character === '&') {
      characters.push(' ');
      skipUntil = ';';
    } else {
      characters.push(character);
    }
  }

  return characters.join('');
};

/** Parse raw or WooCommerce display prices; ranges use the first (lowest) price. */
export const parsePrice = (price: Price): number => {
  if (typeof price === 'number') return price;
  const text = getPriceText(price ?? '');
  const amount = /-?\d[\d\s.,]*/.exec(text)?.[0].replace(/\s/g, '');
  if (!amount) return Number.NaN;

  if (/^-?\d{1,3}([.,]\d{3})+$/.test(amount)) {
    return Number(amount.replace(/[.,]/g, ''));
  }

  const separator = Math.max(amount.lastIndexOf(','), amount.lastIndexOf('.'));
  if (separator === -1) return Number(amount);

  const whole = amount.slice(0, separator).replace(/[.,]/g, '');
  const fraction = amount.slice(separator + 1);
  return Number(`${whole}.${fraction}`);
};

/** The single display formatter for all prices, including variable-product ranges. */
export const formatPrice = (price: Price): string => {
  if (typeof price === 'string') {
    const range = getPriceText(price).split(/(?<=\d)\s*[-–—]\s*/);
    if (range.length > 1)
      return range.map((part) => formatPrice(parsePrice(part))).join(' - ');
  }

  const amount = parsePrice(price);
  return Number.isFinite(amount)
    ? `kr ${priceFormatter.format(amount).replace(/\s/g, ' ')}`
    : 'N/A';
};

/** Calculate a unit price from a formatted line subtotal using the same display policy. */
export const formatUnitPrice = (subtotal: Price, quantity: number): string =>
  formatPrice(
    Number.isFinite(quantity) && quantity > 0
      ? parsePrice(subtotal) / quantity
      : Number.NaN,
  );
