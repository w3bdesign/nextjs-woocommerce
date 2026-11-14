import { describe, expect, it } from 'vitest';

import { formatPrice, formatUnitPrice, parsePrice } from '@/utils/functions/price';

describe('parsePrice', () => {
  it('returns numbers unchanged', () => {
    expect(parsePrice(699)).toBe(699);
    expect(parsePrice(0)).toBe(0);
  });

  it('parses integers without separators', () => {
    expect(parsePrice('699')).toBe(699);
    expect(parsePrice('kr 1500')).toBe(1500);
  });

  it('treats a single group of three digits after a separator as thousands', () => {
    expect(parsePrice('1.398')).toBe(1398);
    expect(parsePrice('1,398')).toBe(1398);
    expect(parsePrice('1.234.567')).toBe(1234567);
  });

  it('treats one or two trailing digits as decimals', () => {
    expect(parsePrice('699,5')).toBe(699.5);
    expect(parsePrice('699.50')).toBe(699.5);
  });

  it('strips HTML tags and entities', () => {
    expect(parsePrice('<bdi><span>kr</span>&nbsp;249,00</bdi>')).toBe(249);
  });

  it('returns NaN for missing or non-numeric input', () => {
    expect(parsePrice(null)).toBeNaN();
    expect(parsePrice(undefined)).toBeNaN();
    expect(parsePrice('')).toBeNaN();
    expect(parsePrice('gratis')).toBeNaN();
  });
});

describe('formatPrice', () => {
  it('formats numbers in Norwegian kroner with two decimals', () => {
    expect(formatPrice(699)).toBe('kr 699,00');
    expect(formatPrice(1398.5)).toBe('kr 1 398,50');
  });

  it('formats ranges using em dash and &mdash; separators', () => {
    expect(formatPrice('kr198,00—kr299,00')).toBe('kr 198,00 - kr 299,00');
    expect(formatPrice('kr198,00 &mdash; kr299,00')).toBe('kr 198,00 - kr 299,00');
  });

  it('does not treat a negative sign as a range separator', () => {
    // nb-NO formats negatives with a Unicode minus sign (U+2212).
    expect(formatPrice('-699,00')).toBe('kr \u2212699,00');
  });

  it('returns N/A for invalid prices', () => {
    expect(formatPrice('abc')).toBe('N/A');
    expect(formatPrice(Number.NaN)).toBe('N/A');
  });
});

describe('formatUnitPrice', () => {
  it('divides the subtotal by the quantity', () => {
    expect(formatUnitPrice('kr2 097,00', 3)).toBe('kr 699,00');
    expect(formatUnitPrice(100, 3)).toBe('kr 33,33');
  });

  it('returns N/A for invalid quantities or subtotals', () => {
    expect(formatUnitPrice('kr699,00', 0)).toBe('N/A');
    expect(formatUnitPrice(null, 1)).toBe('N/A');
  });
});
