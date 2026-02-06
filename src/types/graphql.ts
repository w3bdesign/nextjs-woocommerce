/**
 * GraphQL response shape types.
 * These represent the shape of data returned from WooCommerce GraphQL queries/mutations.
 */

/** Image type as returned by WooCommerce GraphQL API */
export interface IGraphQLImage {
  __typename: string;
  id: string;
  sourceUrl?: string;
  srcSet?: string;
  altText: string;
  title: string;
}

/** Gallery images wrapper from GraphQL */
export interface IGalleryImages {
  __typename: string;
  nodes: IGraphQLImage[];
}

/** A product node inside a cart item from GraphQL */
export interface ICartProductNode {
  __typename: string;
  id: string;
  databaseId: number;
  name: string;
  description: string;
  type: string;
  onSale: boolean;
  slug: string;
  averageRating: number;
  reviewCount: number;
  image: IGraphQLImage;
  galleryImages: IGalleryImages;
  productId: number;
}

/** Product wrapper in a cart item */
export interface ICartProductWrapper {
  __typename: string;
  node: ICartProductNode;
}

/** Variation node inside a cart item */
export interface IVariationNode {
  __typename: string;
  id: string;
  databaseId: number;
  name: string;
  description: string;
  type: string;
  onSale: boolean;
  price: string;
  regularPrice: string;
  salePrice?: string;
  image: IGraphQLImage;
  attributes: {
    nodes: {
      id: string;
      attributeId?: number;
      name: string;
      value: string;
    }[];
  };
}

/** Variation wrapper in a cart item */
export interface IVariationWrapper {
  node: IVariationNode;
}

/**
 * A single cart item node from GET_CART query response.
 * Represents one line item in the WooCommerce cart.
 */
export interface ICartItemNode {
  __typename: string;
  key: string;
  product: ICartProductWrapper;
  variation?: IVariationWrapper;
  quantity: number;
  total: string;
  subtotal: string;
  subtotalTax: string;
}

/** Cart update item for mutation input */
export interface IUpdateCartItem {
  key: string;
  quantity: number;
}

/** Input for the UPDATE_CART mutation */
export interface IUpdateCartInput {
  clientMutationId: string;
  items: IUpdateCartItem[];
}

/** Variables wrapper for the UPDATE_CART mutation */
export interface IUpdateCartVariables {
  input: IUpdateCartInput;
}

/** Root object for update cart mutation call */
export interface IUpdateCartMutationArgs {
  variables: IUpdateCartVariables;
}

/** Props shape for getFormattedCart utility function */
export interface IFormattedCartProps {
  cart: { contents: { nodes: ICartItemNode[] }; total: number };
}
