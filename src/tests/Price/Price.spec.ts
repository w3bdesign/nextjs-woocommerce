import { expect, test } from '@playwright/test';
import {
  formatPrice,
  formatUnitPrice,
  parsePrice,
} from '../../utils/functions/price';

test('standardizes raw, encoded and HTML WooCommerce prices', () => {
  for (const price of [
    699,
    '699.00',
    'kr699.00',
    'kr&nbsp;699,00',
    'kr&#160;699,00',
    'kr&#xA0;699,00',
    'kr\u00a0699,00',
    '<span class="amount">kr&nbsp;699,00</span>',
  ]) {
    expect(parsePrice(price)).toBe(699);
    expect(formatPrice(price)).toBe('kr 699,00');
  }
});

test('supports grouping, decimal separators, zero and negative amounts', () => {
  for (const price of ['1.398,50', '1,398.50', '1 398,50', '1&nbsp;398,50']) {
    expect(parsePrice(price)).toBe(1398.5);
    expect(formatPrice(price)).toBe('kr 1 398,50');
  }
  expect(formatPrice('0')).toBe('kr 0,00');
  expect(parsePrice('-699,00')).toBe(-699);
});

test('preserves variable-product ranges while parsing the lowest price', () => {
  for (const price of [
    'kr198.00 - kr299.00',
    'kr&nbsp;198,00–kr&nbsp;299,00',
    'kr&nbsp;198,00 &ndash; kr&nbsp;299,00',
  ]) {
    expect(parsePrice(price)).toBe(198);
    expect(formatPrice(price)).toBe('kr 198,00 - kr 299,00');
  }
});

test('calculates unit prices without dropping decimal commas', () => {
  expect(formatUnitPrice('kr&nbsp;1.398,00', 2)).toBe('kr 699,00');
  expect(formatUnitPrice('kr&nbsp;699,00', 1)).toBe('kr 699,00');
  expect(formatUnitPrice('kr&nbsp;699,00', 2)).toBe('kr 349,50');
});

test('handles missing prices and invalid quantities safely', () => {
  for (const price of [
    null,
    undefined,
    '',
    'not a price',
    Number.NaN,
    Infinity,
  ]) {
    expect(formatPrice(price)).toBe('N/A');
  }
  for (const quantity of [0, -1, Number.NaN, Infinity]) {
    expect(formatUnitPrice('699,00', quantity)).toBe('N/A');
  }
});
