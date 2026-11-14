// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { config, proxy } from '@/proxy';

const request = (path: string) => new NextRequest(new URL(path, 'http://localhost:3000'));

describe('proxy', () => {
  it('only runs for product and category pages', () => {
    expect(config.matcher).toEqual(['/produkt/:slug', '/kategori/:slug']);
  });

  it('lets clean URLs through', () => {
    const response = proxy(request('/produkt/test-simple'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-middleware-next')).toBe('1');
  });

  it.each(['/produkt/test-simple', '/kategori/tskjorter'])(
    'permanently redirects legacy %s?id= URLs to the clean slug',
    (path) => {
      const response = proxy(request(`${path}?id=123&utm_source=x`));
      expect(response.status).toBe(301);
      expect(response.headers.get('location')).toBe(`http://localhost:3000${path}`);
    },
  );
});
