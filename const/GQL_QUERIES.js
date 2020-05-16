export const FETCH_ALL_PRODUCTS_QUERY = `
query MyQuery {
  products {
    nodes {
      name        
      onSale
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