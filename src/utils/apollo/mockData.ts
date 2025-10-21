export const mockProducts = [
  {
    __typename: 'SimpleProduct',
    id: 'prod-101',
    databaseId: 101,
    averageRating: 4.5,
    name: 'Modern Oak Cabinet',
    description: 'A stylish modern oak cabinet with ample storage space.',
    onSale: false,
    slug: 'modern-oak-cabinet',
    image: {
      __typename: 'MediaItem',
      id: 'img-101',
      uri: '/images/cabinet.jpg',
      title: 'Modern Oak Cabinet',
      srcSet: 'https://placehold.co/300x300 300w, https://placehold.co/600x600 600w',
      sourceUrl: 'https://placehold.co/600x600',
    },
    price: 'kr4999.00',
    regularPrice: 'kr5999.00',
    salePrice: null,
    stockQuantity: 15,
    productCategories: { nodes: [{ name: 'Cabinets', slug: 'cabinets' }] },
    // Enable 3D configurator with cabinet model
    configurator: {
      enabled: true,
      modelId: 'cabinet-v1',
    },
  },
  {
    __typename: 'VariableProduct',
    id: 'prod-102',
    databaseId: 102,
    averageRating: 4.1,
    name: 'Mock Tee',
    description: 'A versatile mock product with variants for testing the shoe configurator POC.',
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
    productCategories: { nodes: [{ name: 'Accessories', slug: 'accessories' }] },
    allPaColors: { nodes: [{ name: 'Red', slug: 'red' }] },
    allPaSizes: { nodes: [{ name: 'M' }] },
    // Enable 3D configurator for testing (shoe POC)
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
  {
    __typename: 'SimpleProduct',
    id: 'prod-103',
    databaseId: 103,
    averageRating: 4.7,
    name: 'Scandinavian Dining Table',
    description: 'Beautiful solid wood dining table with a minimalist design.',
    onSale: true,
    slug: 'scandinavian-dining-table',
    image: {
      __typename: 'MediaItem',
      id: 'img-103',
      uri: '/images/table.jpg',
      title: 'Scandinavian Dining Table',
      srcSet: 'https://placehold.co/300x300 300w, https://placehold.co/600x600 600w',
      sourceUrl: 'https://placehold.co/600x600',
    },
    price: 'kr6999.00',
    regularPrice: 'kr8999.00',
    salePrice: 'kr6999.00',
    stockQuantity: 8,
    productCategories: { nodes: [{ name: 'Tables', slug: 'tables' }] },
  },
  {
    __typename: 'SimpleProduct',
    id: 'prod-104',
    databaseId: 104,
    averageRating: 4.3,
    name: 'Velvet Sofa',
    description: 'Luxurious three-seater velvet sofa in elegant design.',
    onSale: false,
    slug: 'velvet-sofa',
    image: {
      __typename: 'MediaItem',
      id: 'img-104',
      uri: '/images/sofa.jpg',
      title: 'Velvet Sofa',
      srcSet: 'https://placehold.co/300x300 300w, https://placehold.co/600x600 600w',
      sourceUrl: 'https://placehold.co/600x600',
    },
    price: 'kr12999.00',
    regularPrice: 'kr12999.00',
    salePrice: null,
    stockQuantity: 5,
    productCategories: { nodes: [{ name: 'Sofas', slug: 'sofas' }] },
  },
  {
    __typename: 'SimpleProduct',
    id: 'prod-105',
    databaseId: 105,
    averageRating: 4.6,
    name: 'Ergonomic Office Chair',
    description: 'Comfortable office chair with lumbar support and adjustable height.',
    onSale: true,
    slug: 'ergonomic-office-chair',
    image: {
      __typename: 'MediaItem',
      id: 'img-105',
      uri: '/images/chair.jpg',
      title: 'Ergonomic Office Chair',
      srcSet: 'https://placehold.co/300x300 300w, https://placehold.co/600x600 600w',
      sourceUrl: 'https://placehold.co/600x600',
    },
    price: 'kr2499.00',
    regularPrice: 'kr2999.00',
    salePrice: 'kr2499.00',
    stockQuantity: 20,
    productCategories: { nodes: [{ name: 'Chairs', slug: 'chairs' }] },
  },
];

export const mockCategories = {
  productCategories: {
    __typename: 'RootQueryToProductCategoryConnection',
    nodes: [
      { __typename: 'ProductCategory', id: 'cat1', name: 'Sofas', slug: 'sofas' },
      { __typename: 'ProductCategory', id: 'cat2', name: 'Tables', slug: 'tables' },
      { __typename: 'ProductCategory', id: 'cat3', name: 'Chairs', slug: 'chairs' },
      { __typename: 'ProductCategory', id: 'cat4', name: 'Cabinets', slug: 'cabinets' },
      { __typename: 'ProductCategory', id: 'cat5', name: 'Accessories', slug: 'accessories' },
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
  cat1: { id: 'cat1', name: 'Sofas', slug: 'sofas' },
  cat2: { id: 'cat2', name: 'Tables', slug: 'tables' },
  cat3: { id: 'cat3', name: 'Chairs', slug: 'chairs' },
  cat4: { id: 'cat4', name: 'Cabinets', slug: 'cabinets' },
  cat5: { id: 'cat5', name: 'Accessories', slug: 'accessories' },
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
