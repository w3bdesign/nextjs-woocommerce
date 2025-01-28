export interface Image {
  __typename: string;
  sourceUrl?: string;
}

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
