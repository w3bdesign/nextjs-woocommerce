import { useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';

import { useCartStore } from '@/stores/cartStore';
import Button from '@/components/UI/Button.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

import {
  getFormattedCart,
  getUpdatedItems,
  handleQuantityChange,
  IProductRootObject,
} from '@/utils/functions/functions';

import { GET_CART } from '@/utils/gql/GQL_QUERIES';
import { UPDATE_CART } from '@/utils/gql/GQL_MUTATIONS';

const CartContents = () => {
  const router = useRouter();
  const { clearWooCommerceSession, syncWithWooCommerce } = useCartStore();
  const isCheckoutPage = router.pathname === '/kasse';

  const { data, refetch } = useQuery(GET_CART, {
    notifyOnNetworkStatusChange: true,
    onCompleted: () => {
      const updatedCart = getFormattedCart(data);
      if (!updatedCart && !data?.cart?.contents?.nodes?.length) {
        clearWooCommerceSession();
        return;
      }
      if (updatedCart) {
        syncWithWooCommerce(updatedCart);
      }
    },
  });

  const [updateCart, { loading: updateCartProcessing }] = useMutation(
    UPDATE_CART,
    {
      onCompleted: () => {
        refetch();
        // Delayed refetch to ensure WooCommerce backend has settled
        setTimeout(() => {
          refetch();
        }, 3000);
      },
    },
  );

  const handleRemoveProductClick = (
    cartKey: string,
    products: IProductRootObject[],
  ) => {
    if (products?.length) {
      const updatedItems = getUpdatedItems(products, 0, cartKey);
      updateCart({
        variables: {
          input: {
            clientMutationId: uuidv4(),
            items: updatedItems,
          },
        },
      });
    }
    refetch();
    // Delayed refetch to ensure WooCommerce backend has settled
    setTimeout(() => {
      refetch();
    }, 3000);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  const cartTotal = data?.cart?.total || '0';

  const getUnitPrice = (subtotal: string, quantity: number) => {
    const numericSubtotal = parseFloat(subtotal.replace(/[^0-9.-]+/g, ''));
    return isNaN(numericSubtotal)
      ? 'N/A'
      : (numericSubtotal / quantity).toFixed(2);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {data?.cart?.contents?.nodes?.length ? (
        <>
          <div className="bg-surface rounded-lg p-6 mb-8 md:w-full">
            {data.cart.contents.nodes.map((item: IProductRootObject) => (
              <div
                key={item.key}
                className="flex items-center border-b border-border py-4"
              >
                <div className="flex-shrink-0 w-24 h-24 relative hidden md:block">
                  <Image
                    src={
                      item.product.node.image?.sourceUrl || '/placeholder.png'
                    }
                    alt={item.product.node.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <div className="flex-grow ml-4">
                  <h2 className="text-lg font-semibold text-text">
                    {item.product.node.name}
                  </h2>
                  <p className="text-text-muted">
                    kr {getUnitPrice(item.subtotal, item.quantity)}
                  </p>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => {
                      handleQuantityChange(
                        event,
                        item.key,
                        data.cart.contents.nodes,
                        updateCart,
                        updateCartProcessing,
                      );
                    }}
                    className="w-16 px-2 py-1 text-center border border-border rounded-md mr-2 bg-surface focus:ring-2 focus:ring-primary focus:border-primary"
                    aria-label={`Antall ${item.product.node.name}`}
                  />
                  <Button
                    handleButtonClick={() =>
                      handleRemoveProductClick(
                        item.key,
                        data.cart.contents.nodes,
                      )
                    }
                    variant="secondary"
                    buttonDisabled={updateCartProcessing}
                  >
                    Fjern
                  </Button>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold text-text">{item.subtotal}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-surface rounded-lg p-6 md:w-full">
            <div className="flex justify-end mb-4">
              <span className="font-semibold pr-2 text-text">Subtotal:</span>
              <span className="text-text">{cartTotal}</span>
            </div>
            {!isCheckoutPage && (
              <div className="flex justify-center mb-4">
                <Link href="/kasse" passHref>
                  <Button variant="primary" fullWidth>GÅ TIL KASSE</Button>
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-text">
            Ingen produkter i handlekurven
          </h2>
          <Link href="/produkter" passHref>
            <Button variant="primary">Fortsett å handle</Button>
          </Link>
        </div>
      )}
      {updateCartProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-surface p-4 rounded-lg">
            <p className="text-lg mb-2 text-text">Oppdaterer handlekurv...</p>
            <LoadingSpinner />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartContents;
