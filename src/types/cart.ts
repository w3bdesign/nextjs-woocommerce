import { Product } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

export interface CartImage {
  sourceUrl?: string;
  title?: string;
  srcSet?: string;
}

export interface CartItem {
  cartKey: string;
  name: string;
  qty: number;
  price: number; // per-item price as number
  totalPrice: number; // qty * price
  image?: CartImage;
  productId: number;
  variationId?: number;
  configurator?: Product['configurator'];
}

export function mapProductToCartItem(
  product: Product,
  qty = 1,
  variationId?: number,
): CartItem {
  const priceRaw = product.price ?? '0';
  const price = Number.parseFloat(String(priceRaw)) || 0;
  const totalPrice = +(price * qty);

  return {
    cartKey: `${product.databaseId}-${variationId ?? 'base'}-${uuidv4()}`,
    name: product.name,
    qty,
    price,
    totalPrice,
    image: product.image ? { sourceUrl: product.image.sourceUrl } : undefined,
    productId: product.databaseId,
    variationId,
    configurator: product.configurator,
  };
}

export default CartItem;

/**
 * Types representing the GraphQL `GET_CART` response shape
 */
export interface CartImageNode {
  id?: string;
  sourceUrl?: string;
  srcSet?: string;
  altText?: string;
  title?: string;
}

export interface CartProductNode {
  id?: string;
  databaseId?: number;
  name?: string;
  description?: string;
  type?: string;
  onSale?: boolean;
  slug?: string;
  averageRating?: number;
  reviewCount?: number;
  image?: CartImageNode;
  galleryImages?: { nodes?: CartImageNode[] };
}

export interface CartVariationNode {
  node?: {
    id?: string;
    databaseId?: number;
    name?: string;
    description?: string;
    type?: string;
    onSale?: boolean;
    price?: string;
    regularPrice?: string;
    salePrice?: string;
    image?: CartImageNode;
    attributes?: {
      nodes?: Array<{ id?: string; name?: string; value?: string }>;
    };
  };
}

export interface CartContentNode {
  key?: string;
  product?: { node?: CartProductNode };
  variation?: CartVariationNode;
  quantity?: number;
  total?: string;
  subtotal?: string;
  subtotalTax?: string;
  extraData?: Array<{ key: string; value: string }>;
}

export interface GetCartQuery {
  cart?: {
    contents?: { nodes?: CartContentNode[] };
    subtotal?: string;
    subtotalTax?: string;
    shippingTax?: string;
    shippingTotal?: string;
    total?: string;
    totalTax?: string;
    feeTax?: string;
    feeTotal?: string;
    discountTax?: string;
    discountTotal?: string;
  };
}

// CartContentNode is exported above as an interface
