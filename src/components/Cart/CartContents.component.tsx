import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { useCart } from '@/hooks/useCart';
import Button from '@/components/UI/Button.component';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner.component';

import type { CartProduct } from '@/types/cart';

const CartContents = () => {
  const router = useRouter();
  const isCheckoutPage = router.pathname === '/kasse';
  const { cart, isLoading, isUpdating, setQuantity, removeItem } = useCart();

  const products = cart?.products ?? [];
  const hasProducts = products.length > 0;

  const handleQuantityInput = (
    event: React.ChangeEvent<HTMLInputElement>,
    cartKey: string,
  ) => {
    if (isUpdating) {
      return;
    }
    const newQty = event.target.value
      ? Number.parseInt(event.target.value, 10)
      : 1;
    setQuantity(cartKey, newQty);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {hasProducts ? (
        <>
          <div className="bg-surface rounded-lg p-6 mb-8 md:w-full">
            {products.map((item: CartProduct) => (
              <div
                key={item.cartKey}
                className="flex items-center border-b border-border py-4"
              >
                <div className="flex-shrink-0 size-24 relative hidden md:block">
                  <Image
                    src={item.image?.sourceUrl || '/placeholder.png'}
                    alt={item.name}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                <div className="flex-grow ml-4">
                  <h2 className="text-lg font-semibold text-text">
                    {item.name}
                  </h2>
                  <p className="text-text-muted">kr {item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(event) =>
                      handleQuantityInput(event, item.cartKey)
                    }
                    className="w-16 px-2 py-1 text-center border border-border rounded-md mr-2 bg-surface focus:ring-2 focus:ring-primary focus:border-primary"
                    aria-label={`Antall ${item.name}`}
                  />
                  <Button
                    handleButtonClick={() => removeItem(item.cartKey)}
                    variant="secondary"
                    buttonDisabled={isUpdating}
                  >
                    Fjern
                  </Button>
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold text-text">
                    {item.totalPrice}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-surface rounded-lg p-6 md:w-full">
            <div className="flex justify-end mb-4">
              <span className="font-semibold pr-2 text-text">Subtotal:</span>
              <span className="text-text">{cart?.totalProductsPrice}</span>
            </div>
            {!isCheckoutPage && (
              <div className="flex justify-center mb-4">
                <Link href="/kasse" passHref>
                  <Button variant="primary" fullWidth>
                    GÅ TIL KASSE
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </>
      ) : (
        !isLoading && (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-text">
              Ingen produkter i handlekurven
            </h2>
            <Link href="/produkter" passHref>
              <Button variant="primary">Fortsett å handle</Button>
            </Link>
          </div>
        )
      )}
      {isUpdating && (
        <div className="fixed inset-0 flex items-center justify-center bg-overlay bg-opacity-50">
          <div className="bg-surface p-4 rounded-lg">
            <p className="text-lg mb-2 text-text">Oppdaterer handlekurv…</p>
            <LoadingSpinner />
          </div>
        </div>
      )}
    </div>
  );
};

export default CartContents;
