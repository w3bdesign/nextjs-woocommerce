// Imports
import { useContext, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';

// Components
import Button from '@/components/UI/Button.component';

// State
import { CartContext, Product, RootObject } from '@/utils/context/CartProvider';

// Utils
import { getFormattedCart } from '@/utils/functions/functions';

// GraphQL
import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { ADD_TO_CART } from '@/utils/gql/GQL_MUTATIONS';

export interface MyImage {
  __typename: string;
  id: string;
  sourceUrl?: string;
  srcSet?: string;
  altText: string;
  title: string;
}

export interface GalleryImages {
  __typename: string;
  nodes: any[];
}

export interface Node {
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
  image: MyImage;
  galleryImages: GalleryImages;
  productId: number;
}

export interface MyProduct {
  __typename: string;
  node: Node;
}

export interface testRootObject {
  __typename: string;
  key: string;
  product: MyProduct;
  variation?: any;
  quantity: number;
  total: string;
  subtotal: string;
  subtotalTax: string;
}

const testFormattedCart = (data: {
  cart: { contents: { nodes: testRootObject[] }; total: number };
}) => {
  let formattedCart: RootObject = {
    products: [],
    totalProductsCount: 0,
    totalProductsPrice: 0,
  };

  if (!data || !data.cart.contents.nodes.length || !data.cart) {
    return;
  }
  const givenProducts = data.cart.contents.nodes;

  // Create an empty object.
  formattedCart.products = [];

  let product: Product;

  let totalProductsCount = 0;
  let i = 0;

  if (!givenProducts.length) {
    return;
  }

  givenProducts.forEach(() => {
    const givenProduct = givenProducts[i].product.node;

    // Convert price to a float value
    const convertedCurrency = givenProducts[i].total.replace(/[^0-9.-]+/g, '');

    product.productId = givenProduct.productId;
    product.cartKey = givenProducts[i].key;
    product.name = givenProduct.name;
    product.qty = givenProducts[i].quantity;
    product.price = Number(convertedCurrency) / product.qty;
    product.totalPrice = givenProducts[i].total;

    // Ensure we can add products without images to the cart

    product.image = givenProduct.image.sourceUrl
      ? {
          sourceUrl: givenProduct.image.sourceUrl,
          srcSet: givenProduct.image.srcSet,
          title: givenProduct.image.title,
        }
      : {
          sourceUrl: process.env.NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL,
          srcSet: process.env.NEXT_PUBLIC_PLACEHOLDER_SMALL_IMAGE_URL,
          title: givenProduct.name,
        };

    totalProductsCount += givenProducts[i].quantity;

    // Push each item into the products array.
    formattedCart.products.push(product);
    i++;
  });
  formattedCart.totalProductsCount = totalProductsCount;
  formattedCart.totalProductsPrice = data.cart.total;

  return formattedCart;
};

/**
 * Handles the Add to cart functionality.
 * Uses GraphQL for product data
 * @param {Object} product // Product data
 */
const AddToCart = ({ product }: any) => {
  const { setCart } = useContext(CartContext);
  const [requestError, setRequestError] = useState<boolean>(false);

  const productId = product.databaseId ? product.databaseId : product;

  const productQueryInput = {
    clientMutationId: uuidv4(), // Generate a unique id.
    productId,
  };

  // Get cart data query
  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      // Update cart in the localStorage.
      //const updatedCart = getFormattedCart(data) as RootObject;
      const updatedCart = testFormattedCart(data);

      if (!updatedCart) {
        return;
      }

      localStorage.setItem('woocommerce-cart', JSON.stringify(updatedCart));

      // Update cart data in React Context.
      setCart(updatedCart);
    },
  });

  // Add to cart mutation
  const [addToCart, { loading: addToCartLoading }] = useMutation(ADD_TO_CART, {
    variables: {
      input: productQueryInput,
    },

    onCompleted: () => {
      // Update the cart with new values in React context.
      refetch();
    },

    onError: () => {
      setRequestError(true);
    },
  });

  const handleAddToCart = () => {
    addToCart();
  };

  return (
    <>
      <Button
        handleButtonClick={() => handleAddToCart()}
        buttonDisabled={addToCartLoading || requestError}
      >
        KJØP
      </Button>
    </>
  );
};

export default AddToCart;
