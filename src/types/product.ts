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
  attributes?: {
    nodes: Array<{
      id: string;
      name: string;
      options: string[];
    }>;
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
  /** Optional: 3D Configurator metadata */
  configurator?: {
    enabled: boolean;
    modelId: string; // Deprecated: Use familyId for family-based products
    familyId?: string; // NEW: Model family ID for variant switching system
    customPricing?: Record<string, number>;
    defaultConfiguration?: Record<string, string>;
  };
}

export interface ProductType {
  id: string;
  name: string;
  checked: boolean;
}
