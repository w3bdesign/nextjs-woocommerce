import { ApolloLink, Observable } from '@apollo/client';
import { print } from 'graphql';
import {
  ADD_TO_CART,
  CHECKOUT_MUTATION,
  CREATE_USER,
  LOGIN_USER,
  UPDATE_CART,
} from '../gql/GQL_MUTATIONS';
import {
  FETCH_ALL_CATEGORIES_QUERY,
  FETCH_ALL_PRODUCTS_QUERY,
  GET_CART,
  GET_CURRENT_USER,
  GET_CUSTOMER_ORDERS,
  GET_PRODUCTS_FROM_CATEGORY,
  GET_SINGLE_PRODUCT,
} from '../gql/GQL_QUERIES';
import {
  getProductBySlug,
  getProductsByCategoryId,
  mockCart,
  mockCategories,
  mockCustomer,
  mockOrders,
  mockProducts,
} from './mockData';

function match(query: any, target: any) {
  try {
    return print(query) === print(target);
  } catch {
    return false;
  }
}

export const mockLink = new ApolloLink((operation) => {
  const { query, variables } = operation;
  // Best-effort operation name detection
  let operationName: string | undefined = operation.operationName;
  if (!operationName) {
    try {
      const def = (query as any)?.definitions?.find(
        (d: any) => d.kind === 'OperationDefinition',
      );
      operationName = def?.name?.value;
    } catch (e) {
      // Swallow query parse errors safely when extracting operation name
      void e;
    }
  }

  return new Observable((observer) => {
    // Simulate tiny latency
    setTimeout(() => {
      try {
        if (
          match(query, FETCH_ALL_PRODUCTS_QUERY) ||
          operationName === 'MyQuery'
        ) {
          observer.next({
            data: {
              products: {
                __typename: 'RootQueryToProductConnection',
                nodes: mockProducts,
              },
            },
          });
          observer.complete();
          return;
        }

        if (
          match(query, FETCH_ALL_CATEGORIES_QUERY) ||
          operationName === 'Categories'
        ) {
          observer.next({ data: mockCategories });
          observer.complete();
          return;
        }

        if (match(query, GET_CART)) {
          observer.next({ data: mockCart });
          observer.complete();
          return;
        }

        if (match(query, GET_SINGLE_PRODUCT) || operationName === 'Product') {
          const slug = variables?.slug as string;
          const product = slug ? getProductBySlug(slug) : undefined;
          observer.next({ data: { product } });
          observer.complete();
          return;
        }

        if (
          match(query, GET_PRODUCTS_FROM_CATEGORY) ||
          operationName === 'ProductsFromCategory'
        ) {
          const id = variables?.id as string;
          const products = id ? getProductsByCategoryId(id) : [];
          observer.next({
            data: {
              productCategory: {
                id,
                name:
                  products[0]?.productCategories?.nodes?.[0]?.name ||
                  'Category',
                __typename: 'ProductCategory',
                products: {
                  __typename: 'ProductToProductConnection',
                  nodes: products,
                },
              },
            },
          });
          observer.complete();
          return;
        }

        if (
          match(query, GET_CURRENT_USER) ||
          operationName === 'GET_CURRENT_USER'
        ) {
          observer.next({ data: mockCustomer });
          observer.complete();
          return;
        }

        if (
          match(query, GET_CUSTOMER_ORDERS) ||
          operationName === 'GET_CUSTOMER_ORDERS'
        ) {
          observer.next({ data: mockOrders });
          observer.complete();
          return;
        }

        if (match(query, ADD_TO_CART) || match(query, UPDATE_CART)) {
          // Very naive cart echo
          observer.next({
            data: {
              addToCart: { cartItem: null },
              updateItemQuantities: { items: [] },
            },
          });
          observer.complete();
          return;
        }

        if (match(query, CHECKOUT_MUTATION)) {
          observer.next({
            data: { checkout: { result: 'SUCCESS', redirect: null } },
          });
          observer.complete();
          return;
        }

        if (match(query, CREATE_USER)) {
          observer.next({
            data: {
              registerCustomer: {
                customer: {
                  id: 'mock',
                  email: variables?.email,
                  firstName: variables?.firstName ?? 'Test',
                  lastName: variables?.lastName ?? 'User',
                  username: variables?.username,
                },
              },
            },
          });
          observer.complete();
          return;
        }

        if (match(query, LOGIN_USER)) {
          observer.next({
            data: {
              loginWithCookies: { status: 'SUCCESS', clientMutationId: null },
            },
          });
          observer.complete();
          return;
        }

        // Default: minimal empty structures to avoid undefined access
        console.warn(
          `[MockLink] Unhandled operation: ${operationName || 'unknown'}. Returning empty response.`,
        );
        observer.next({ data: {} });
        observer.complete();
      } catch (e) {
        observer.error(e);
      }
    }, 200);
  });
});
