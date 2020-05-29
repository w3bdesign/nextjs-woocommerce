/**
 * Provides static object with initial products upon loading. 
 * This is good if the server is down, slow or unreachable as we can still display some products.
 */
export const INITIAL_PRODUCTS = {
  products: {
    nodes: [
      {
        productId: 46,
        name: 'Variabelt Produkt Statisk',
        onSale: false,
        slug: 'test-produkt-4',
        image: {
          sourceUrl:
            'https://res.cloudinary.com/duelisue0/image/upload/c_fit,h_490,w_325/Nextjs-Woocommerce/lynne-baltzer-_Qqfhl2sCFE-unsplash-scaled_bfjiej.jpg',
        },
        price: 'kr799.00',
        regularPrice: 'kr799.00',
        salePrice: null,
      },
      {
        productId: 45,
        name: 'Test Produkt 3 Ikke På Lager',
        onSale: true,
        slug: 'test-produkt-3',
        image: {
          sourceUrl:
            'https://res.cloudinary.com/duelisue0/image/upload/c_fit,h_490,w_325/v1590520040/Nextjs-Woocommerce/taylor-dG4Eb_oC5iM-unsplash_kfgrw4.jpg',
        },
        price: 'kr799.00',
        regularPrice: 'kr999.00',
        salePrice: 'kr799.00',
      },
      {
        productId: 44,
        name: 'Test Produkt 2',
        onSale: true,
        slug: 'test-produkt-2',
        image: {
          sourceUrl:
            'https://res.cloudinary.com/duelisue0/image/upload/c_fit,h_490,w_325/v1590520040/Nextjs-Woocommerce/milad-shams-LUCWiFdK1rs-unsplash-scaled_aypez1.jpg',
        },
        price: 'kr399.00',
        regularPrice: 'kr899.00',
        salePrice: 'kr399.00',
      },
      {
        productId: 42,
        name: 'Test Produkt',
        onSale: true,
        slug: 'test-produkt',
        image: {
          sourceUrl:
            'https://res.cloudinary.com/duelisue0/image/upload/c_fit,h_490,w_325/v1590520040/Nextjs-Woocommerce/rezasaad-w0J1odQXj3A-unsplash-scaled_mrcbf9.jpg',
        },
        price: 'kr499.00',
        regularPrice: 'kr999.00',
        salePrice: 'kr499.00',
      },
    ],
  },
};
