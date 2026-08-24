import { gql } from '@apollo/client';

import { CART_FIELDS } from './GQL_QUERIES';

export const LOGIN_USER = gql`
  mutation Login($username: String!, $password: String!) {
    loginWithCookies(input: { login: $username, password: $password }) {
      status
      clientMutationId
    }
  }
`;

export const ADD_TO_CART = gql`
  mutation ($input: AddToCartInput!) {
    addToCart(input: $input) {
      cart {
        ...CartFields
      }
    }
  }
  ${CART_FIELDS}
`;

export const CHECKOUT_MUTATION = gql`
  mutation CHECKOUT_MUTATION($input: CheckoutInput!) {
    checkout(input: $input) {
      result
      redirect
    }
  }
`;
export const UPDATE_CART = gql`
  mutation ($input: UpdateItemQuantitiesInput!) {
    updateItemQuantities(input: $input) {
      cart {
        ...CartFields
      }
    }
  }
  ${CART_FIELDS}
`;
