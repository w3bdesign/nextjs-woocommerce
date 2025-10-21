export const mockProducts = [
  {
    __typename: 'SimpleProduct',
    id: 'prod-101',
    databaseId: 101,
    averageRating: 4.5,
    name: 'Mock Hoodie',
    description: 'A cozy mock hoodie for testing.',
    onSale: false,
    slug: 'mock-hoodie',
    image: {
      __typename: 'MediaItem',
      id: 'img-101',
      uri: '/images/hoodie.jpg',
      title: 'Mock Hoodie',
      srcSet: 'https://placehold.co/300x300 300w, https://placehold.co/600x600 600w',
      sourceUrl: 'https://placehold.co/600x600',
    },
    price: 'kr499.00',
    regularPrice: 'kr599.00',
    salePrice: null,
    stockQuantity: 15,
    productCategories: { nodes: [{ name: 'Hoodies', slug: 'hoodies' }] },
  },
  {
    __typename: 'VariableProduct',
    id: 'prod-102',
    databaseId: 102,
    averageRating: 4.1,
    name: 'Mock Tee',
    description: 'A versatile mock t-shirt with variants.',
    onSale: true,
    slug: 'mock-tee',
    image: {
      __typename: 'MediaItem',
      id: 'img-102',
      uri: '/images/tee.jpg',
      title: 'Mock Tee',
      srcSet: 'https://placehold.co/300x300 300w, https://placehold.co/600x600 600w',
      sourceUrl: 'https://placehold.co/600x600',
    },
    price: 'kr299.00 - kr349.00',
    regularPrice: 'kr349.00',
    salePrice: 'kr299.00',
    productCategories: { nodes: [{ name: 'T-shirts', slug: 't-shirts' }] },
    allPaColors: { nodes: [{ name: 'Red', slug: 'red' }] },
    allPaSizes: { nodes: [{ name: 'M' }] },
    // Enable 3D configurator for testing
    configurator: {
      enabled: true,
      modelId: 'shoe-v1',
    },
    variations: {
      __typename: 'ProductVariationConnection',
      nodes: [
        {
          __typename: 'ProductVariation',
          id: 'var-201',
          databaseId: 201,
          name: 'Mock Tee - Red / M',
          stockStatus: 'IN_STOCK',
          stockQuantity: 7,
          purchasable: true,
          onSale: true,
          price: 'kr299.00',
          salePrice: 'kr299.00',
          regularPrice: 'kr349.00',
          attributes: { nodes: [] },
        },
      ],
    },
  },
];

export const mockCategories = {
  productCategories: {
    __typename: 'RootQueryToProductCategoryConnection',
    nodes: [
      { __typename: 'ProductCategory', id: 'cat1', name: 'Hoodies', slug: 'hoodies' },
      { __typename: 'ProductCategory', id: 'cat2', name: 'T-shirts', slug: 't-shirts' },
    ],
  },
};

export const mockCart = {
  cart: {
    contents: {
      nodes: [],
    },
    subtotal: '0',
    subtotalTax: '0',
    shippingTax: '0',
    shippingTotal: '0',
    total: '0',
    totalTax: '0',
    feeTax: '0',
    feeTotal: '0',
    discountTax: '0',
    discountTotal: '0',
    __typename: 'Cart',
  },
};

// Category helpers
export const categoryById: Record<string, { id: string; name: string; slug: string }> = {
  cat1: { id: 'cat1', name: 'Hoodies', slug: 'hoodies' },
  cat2: { id: 'cat2', name: 'T-shirts', slug: 't-shirts' },
};

export function getProductBySlug(slug: string) {
  return mockProducts.find((p) => p.slug === slug);
}

export function getProductsByCategoryId(id: string) {
  const cat = categoryById[id];
  if (!cat) return [];
  return mockProducts.filter((p) => p.productCategories?.nodes?.some((c: any) => c.slug === cat.slug));
}

// Mock user and orders
export const mockCustomer = {
  customer: {
    id: 'cust-1',
    firstName: 'Ola',
    lastName: 'Nordmann',
    email: 'ola@example.com',
    __typename: 'Customer',
  },
};

export const mockOrders = {
  customer: {
    __typename: 'Customer',
    orders: {
      __typename: 'OrderConnection',
      nodes: [
        {
          id: 'order-1001',
          orderNumber: 1001,
          status: 'COMPLETED',
          total: 'kr848.00',
          date: new Date().toISOString(),
          __typename: 'Order',
        },
      ],
    },
  },
};
