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
      }
      ... on VariableProduct {
        price
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
