import Link from 'next/link';

import Button from '@/components/UI/Button.component';
import { formatPrice } from '@/utils/functions/price';

interface ICartSummaryProps {
  total: string;
  /** Hide the checkout link when already on the checkout page. */
  showCheckoutLink: boolean;
}

/**
 * Cart subtotal and the link to checkout.
 */
const CartSummary = ({ total, showCheckoutLink }: ICartSummaryProps) => (
  <div className="pt-5">
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-base font-semibold text-text">Subtotal</span>
      <span className="whitespace-nowrap text-lg font-semibold text-text">
        {formatPrice(total)}
      </span>
    </div>
    {showCheckoutLink && (
      <div className="mt-5 flex md:justify-end">
        <Link href="/kasse" passHref className="w-full md:w-auto">
          <Button variant="primary" fullWidth>
            GÅ TIL KASSE
          </Button>
        </Link>
      </div>
    )}
  </div>
);

export default CartSummary;
