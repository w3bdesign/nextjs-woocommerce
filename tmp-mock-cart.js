// Temporary agent-browser init script: serves a mocked WooCommerce cart for GET_CART.
(() => {
  const realFetch = window.fetch.bind(window);
  const item = (id, name, quantity, total, img) => ({
    __typename: 'SimpleCartItem',
    key: `mock-key-${id}`,
    product: {
      __typename: 'CartItemToProductConnectionEdge',
      node: {
        __typename: 'SimpleProduct', id: `mock-product-${id}`, databaseId: id, name,
        description: `<p>${name}</p>`, type: 'SIMPLE', onSale: false, slug: `mock-${id}`,
        averageRating: 0, reviewCount: 0,
        image: img ? { __typename: 'MediaItem', id: `img-${id}`, sourceUrl: img, srcSet: null, altText: name, title: name } : null,
        galleryImages: { __typename: 'ProductToMediaItemConnection', nodes: [] },
      },
    },
    variation: null, quantity, total, subtotal: total, subtotalTax: 'kr0.00',
  });
  const cart = {
    __typename: 'Cart',
    contents: {
      __typename: 'CartToCartItemConnection',
      nodes: [
        item(1, 'Test Simple', 3, 'kr2097.00', '/images/hero.jpg'),
        item(2, 'Ekstra langt produktnavn for herreklær i økologisk bomull', 12, 'kr14388.00', '/images/hero.jpg'),
      ],
    },
    subtotal: 'kr16485.00', subtotalTax: 'kr0.00', shippingTax: 'kr0.00', shippingTotal: 'kr0.00',
    total: 'kr16485.00', totalTax: 'kr0.00', feeTax: 'kr0.00', feeTotal: 'kr0.00',
    discountTax: 'kr0.00', discountTotal: 'kr0.00',
  };
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.includes('/graphql') && init?.body && /\bcart\s*\{/.test(String(init.body))) {
      return new Response(JSON.stringify({ data: { cart } }), {
        status: 200, headers: { 'content-type': 'application/json' },
      });
    }
    return realFetch(input, init);
  };
})();
