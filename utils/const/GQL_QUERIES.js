export const FETCH_ALL_PRODUCTS_QUERY = `
query MyQuery {
  products {
    nodes {
      productId
      name
      onSale
      slug
      image {
        sourceUrl
      }
      ... on SimpleProduct {
        price
        regularPrice
        salePrice
      }
      ... on VariableProduct {
        price
        regularPrice
        salePrice
      }
    }
  }
}
`;

export const FETCH_ALL_CATEGORIES_QUERY = `
query MyQuery {
  productCategories {
    nodes {
      name
    }
  }
}
`;
