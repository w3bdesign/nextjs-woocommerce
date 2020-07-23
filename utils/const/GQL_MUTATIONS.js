import {gql} from '@apollo/client';

export const ADD_TO_CART = gql`
  mutation($input: AddToCartInput!) {
    addToCart(input: $input) {
      cartItem {
        key
        product {
          id
          productId
          name
          description
          type
          onSale
          slug
          averageRating
          reviewCount
          image {
            id
            sourceUrl
            altText
          }
          galleryImages {
            nodes {
              id
              sourceUrl
              altText
            }
          }
        }
        variation {
          id
          variationId
          name
          description
          type
          onSale
          price
          regularPrice
          salePrice
          image {
            id
            sourceUrl
            altText
          }
          attributes {
            nodes {
              id
              attributeId
              name
              value
            }
          }
        }
        quantity
        total
        subtotal
        subtotalTax
      }
    }
  }
`;

export const CHECKOUT_MUTATION = gql`
  mutation CHECKOUT_MUTATION($input: CheckoutInput!) {
    checkout(input: $input) {
      clientMutationId
      order {
        id
        orderId
        refunds {
          nodes {
            amount
          }
        }
        status
      }
      result
      redirect
    }
  }
`;

export const UPDATE_CART = gql`
  mutation($input: UpdateItemQuantitiesInput!) {
    updateItemQuantities(input: $input) {
      items {
        key
        product {
          id
          productId
          name
          description
          type
          onSale
          slug
          averageRating
          reviewCount
          image {
            id
            sourceUrl
            altText
          }
          galleryImages {
            nodes {
              id
              sourceUrl
              altText
            }
          }
        }
        variation {
          id
          variationId
          name
          description
          type
          onSale
          price
          regularPrice
          salePrice
          image {
            id
            sourceUrl
            altText
          }
          attributes {
            nodes {
              id
              attributeId
              name
              value
            }
          }
        }
        quantity
        total
        subtotal
        subtotalTax
      }
      removed {
        key
        product {
          id
          productId
        }
        variation {
          id
          variationId
        }
      }
      updated {
        key
        product {
          id
          productId
        }
        variation {
          id
          variationId
        }
      }
    }
  }
`;
