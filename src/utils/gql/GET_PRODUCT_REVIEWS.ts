import { gql } from '@apollo/client';

export const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($slug: ID!, $first: Int, $after: String) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      onSale
      image {
        id
        uri
        title
        srcSet
        sourceUrl
      }
      reviewsAllowed
      averageRating
      reviewCount
      ... on SimpleProduct {
        salePrice
        regularPrice
        price
        id
        stockQuantity
        configurator {
          enabled
          modelId
          familyId
        }
      }
      ... on VariableProduct {
        salePrice
        regularPrice
        price
        id
        attributes {
          nodes {
            id
            name
            options
          }
        }
        variations {
          nodes {
            id
            databaseId
            name
            stockStatus
            stockQuantity
            purchasable
            onSale
            salePrice
            regularPrice
          }
        }
        configurator {
          enabled
          modelId
          familyId
        }
      }
      ... on ExternalProduct {
        price
        id
        externalUrl
        configurator {
          enabled
          modelId
          familyId
        }
      }
      ... on GroupProduct {
        products {
          nodes {
            ... on SimpleProduct {
              id
              price
            }
          }
        }
        id
        configurator {
          enabled
          modelId
          familyId
        }
      }
      reviews(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          cursor
          node {
            id
            databaseId
            author {
              node {
                name
              }
            }
            content
            date
            approved
            ... on Comment {
              commentId
              rating
              verified
            }
          }
        }
      }
    }
  }
`;
