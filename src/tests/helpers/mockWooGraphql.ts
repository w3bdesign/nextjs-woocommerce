import type { Page, Route } from '@playwright/test';

/**
 * Mocks the WooCommerce GraphQL endpoint for requests made *by the browser*.
 *
 * Server-side rendering still hits the real backend (Node is not affected by
 * page.route), so SSR/ISR data stays real while client-side cart mutations are
 * deterministic and independent of the backend's CORS configuration.
 */

export const MOCK_SESSION_TOKEN = 'mock-session-token';

// Fake image. Must be a local path: next/image throws for remote hostnames
// that are not listed in next.config.ts `images.remotePatterns`.
const MOCK_IMAGE_URL = '/mock/fake-product-image.jpg';

const ORIGIN = 'http://localhost:3000';

const corsHeaders = {
  'access-control-allow-origin': ORIGIN,
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers': 'content-type, woocommerce-session',
  'access-control-allow-methods': 'POST, GET, OPTIONS',
  'access-control-expose-headers': 'woocommerce-session',
};

export interface MockProduct {
  databaseId: number;
  name: string;
  slug: string;
  price: string;
  /** Set to false to mock a product without an image. Defaults to true. */
  hasImage?: boolean;
}

export interface MockOptions {
  /** Quantity already in the cart before the test starts. Defaults to 0. */
  initialQuantity?: number;
  /** Delay in ms before cart query responses are returned. Defaults to 0. */
  cartDelayMs?: number;
}

const productNode = (p: MockProduct) => ({
  __typename: 'SimpleProduct',
  id: `mock-product-${p.databaseId}`,
  databaseId: p.databaseId,
  name: p.name,
  description: `<p>${p.name}</p>`,
  type: 'SIMPLE',
  onSale: false,
  slug: p.slug,
  averageRating: 0,
  reviewCount: 0,
  image:
    p.hasImage === false
      ? null
      : {
          __typename: 'MediaItem',
          id: 'mock-image',
          sourceUrl: MOCK_IMAGE_URL,
          srcSet: null,
          altText: p.name,
          title: p.name,
        },
  galleryImages: { __typename: 'ProductToMediaItemConnection', nodes: [] },
});

const cartItem = (p: MockProduct, quantity: number) => {
  const total = `kr${(Number(p.price) * quantity).toFixed(2)}`;
  return {
    __typename: 'SimpleCartItem',
    key: `mock-key-${p.databaseId}`,
    product: {
      __typename: 'CartItemToProductConnectionEdge',
      node: productNode(p),
    },
    variation: null,
    quantity,
    total,
    subtotal: total,
    subtotalTax: 'kr0.00',
  };
};

/**
 * Installs the mock. Returns a handle exposing the mocked cart state.
 */
export const mockWooGraphql = async (
  page: Page,
  product: MockProduct,
  { initialQuantity = 0, cartDelayMs = 0 }: MockOptions = {},
) => {
  const state = { quantity: initialQuantity, requests: [] as string[] };

  const cart = () => {
    const nodes = state.quantity ? [cartItem(product, state.quantity)] : [];
    const total = `kr${(Number(product.price) * state.quantity).toFixed(2)}`;
    return {
      __typename: 'Cart',
      contents: { __typename: 'CartToCartItemConnection', nodes },
      subtotal: total,
      subtotalTax: 'kr0.00',
      shippingTax: 'kr0.00',
      shippingTotal: 'kr0.00',
      total,
      totalTax: 'kr0.00',
      feeTax: 'kr0.00',
      feeTotal: 'kr0.00',
      discountTax: 'kr0.00',
      discountTotal: 'kr0.00',
    };
  };

  const json = (route: Route, body: unknown) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { ...corsHeaders, 'woocommerce-session': MOCK_SESSION_TOKEN },
      body: JSON.stringify(body),
    });

  await page.route('**/graphql', async (route) => {
    const request = route.request();

    if (request.method() === 'OPTIONS') {
      return route.fulfill({ status: 204, headers: corsHeaders });
    }

    const { query = '' } = request.postDataJSON() ?? {};

    if (/addToCart\s*\(/.test(query)) {
      state.requests.push('addToCart');
      state.quantity += 1;
      return json(route, {
        data: {
          addToCart: {
            __typename: 'AddToCartPayload',
            cartItem: cartItem(product, state.quantity),
          },
        },
      });
    }

    if (/\bcart\s*\{/.test(query)) {
      state.requests.push('GET_CART');
      if (cartDelayMs) {
        await new Promise((resolve) => setTimeout(resolve, cartDelayMs));
      }
      return json(route, { data: { cart: cart() } });
    }

    if (/\bcustomer\s*\{/.test(query)) {
      state.requests.push('customer');
      return json(route, { data: { customer: null } });
    }

    // Anything unexpected: let it reach the real backend.
    return route.continue();
  });

  return state;
};
