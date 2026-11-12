'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useCart } from '@/hooks/useCart';
import Button from '@/components/UI/Button.component';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';
import CartItem from '@/components/Cart/CartItem.component';
import CartSkeleton from '@/components/Cart/CartSkeleton.component';
import CartSummary from '@/components/Cart/CartSummary.component';

/**
 * Cart page body: picks the loading, empty or filled state.
 * Data and actions come from useCart; each row and the summary render themselves.
 */
const CartContents = () => {
  const isCheckoutPage = usePathname() === '/kasse';
  const { items, total, isInitialLoad, isUpdating, setQuantity } = useCart();

  const renderBody = () => {
    if (isInitialLoad) return <CartSkeleton />;

    if (!items.length) {
      return (
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-text">
            Ingen produkter i handlekurven
          </h2>
          <Link href="/produkter" passHref>
            <Button variant="primary">Fortsett å handle</Button>
          </Link>
        </div>
      );
    }

    return (
      <>
        <ul className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <CartItem
              key={item.key}
              item={item}
              disabled={isUpdating}
              onQuantityChange={(quantity) => setQuantity(item.key, quantity)}
            />
          ))}
        </ul>
        <CartSummary total={total} showCheckoutLink={!isCheckoutPage} />
      </>
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-6 md:py-8">
      {renderBody()}
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
