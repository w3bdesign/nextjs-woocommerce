/**
 * Catalog/display product types used in product listings and single product pages.
 */

/** Minimal image for catalog display */
export interface Image {
  __typename: string;
  sourceUrl?: string;
}

/** Variation price node for catalog display */
export interface Node {
  __typename: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
}

export interface ProductCategory {
  name: string;
  slug: string;
}

export interface ColorNode {
  name: string;
  slug: string;
}

export interface SizeNode {
  name: string;
}

export interface AttributeNode {
  name: string;
  value: string;
}

/** Product as returned in catalog listings (FETCH_ALL_PRODUCTS_QUERY) */
export interface Product {
  __typename: string;
  databaseId: number;
  name: string;
  onSale: boolean;
  slug: string;
  image: Image;
  price: string;
  regularPrice: string;
  salePrice?: string;
  productCategories?: {
    nodes: ProductCategory[];
  };
  allPaColors?: {
    nodes: ColorNode[];
  };
  allPaSizes?: {
    nodes: SizeNode[];
  };
  variations: {
    nodes: Array<{
      price: string;
      regularPrice: string;
      salePrice?: string;
      attributes?: {
        nodes: AttributeNode[];
      };
    }>;
  };
}

export interface ProductType {
  id: string;
  name: string;
  checked: boolean;
}

// --- Single Product Page Types (from GET_SINGLE_PRODUCT query) ---

/** Detailed image for single product page */
export interface ISingleProductImage {
  __typename: string;
  id: string;
  uri: string;
  title: string;
  srcSet: string;
  sourceUrl: string;
}

/** Variation name node (for colors/sizes dropdowns) */
export interface IVariationNameNode {
  __typename: string;
  name: string;
}

export interface IAllPaColors {
  __typename: string;
  nodes: IVariationNameNode[];
}

export interface IAllPaSizes {
  __typename: string;
  nodes: IVariationNameNode[];
}

/** A single variation with stock/pricing info */
export interface IVariationDetail {
  __typename: string;
  id: string;
  databaseId: number;
  name: string;
  stockStatus: string;
  stockQuantity: number;
  purchasable: boolean;
  onSale: boolean;
  salePrice?: string;
  regularPrice: string;
}

export interface IVariations {
  __typename: string;
  nodes: IVariationDetail[];
}

/** Full single product from GET_SINGLE_PRODUCT query */
export interface ISingleProduct {
  __typename: string;
  id: string;
  databaseId: number;
  averageRating: number;
  slug: string;
  description: string;
  onSale: boolean;
  image: ISingleProductImage;
  name: string;
  salePrice?: string;
  regularPrice: string;
  price: string;
  stockQuantity: number;
  allPaColors?: IAllPaColors;
  allPaSizes?: IAllPaSizes;
  variations?: IVariations;
}

/** Props for components that receive a single product */
export interface ISingleProductProps {
  product: ISingleProduct;
  variationId?: number;
  fullWidth?: boolean;
}

// --- Display Products Types ---

/** Variations wrapper for catalog product display */
export interface IDisplayVariations {
  __typename: string;
  nodes: Node[];
}

/** Product shape used in DisplayProducts component */
export interface IDisplayProduct {
  __typename: string;
  name: string;
  onSale: boolean;
  slug: string;
  image: Image;
  price: string;
  regularPrice: string;
  salePrice?: string;
  variations: IDisplayVariations;
}
