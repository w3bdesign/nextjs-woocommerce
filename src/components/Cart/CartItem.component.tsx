import Image from 'next/image';

import type { IProductRootObject } from '@/utils/functions/functions';
import { formatPrice, formatUnitPrice } from '@/utils/functions/price';

interface ICartItemProps {
  item: IProductRootObject;
  disabled: boolean;
  /** Set the line to an exact quantity; 0 removes it. */
  onQuantityChange: (quantity: number) => void;
}

const stepperButtonClasses =
  'flex h-full w-10 items-center justify-center text-lg text-text transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40';

/**
 * A single cart line: thumbnail, name, prices, quantity stepper and remove button.
 */
const CartItem = ({ item, disabled, onQuantityChange }: ICartItemProps) => {
  const { name, image } = item.product.node;

  return (
    <li className="flex gap-4 py-5">
      <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-md bg-surface-alt sm:size-24">
        {image?.sourceUrl ? (
          <Image
            src={image.sourceUrl}
            alt={name}
            fill
            sizes="(min-width: 640px) 96px, 80px"
            className="object-cover"
          />
        ) : (
          // No product image: show a neutral icon instead of requesting a fallback file
          <div className="flex size-full items-center justify-center text-text-light">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-8"
              role="img"
              aria-label={`Ingen bilde av ${name}`}
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
        {/* Product info and line total: stacked on small phones,
            side by side (total on the right) from the sm breakpoint */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <h2 className="break-words text-base font-semibold leading-snug text-text sm:text-lg">
              {name}
            </h2>
            <p className="mt-1 whitespace-nowrap text-sm text-text-muted">
              {formatUnitPrice(item.subtotal, item.quantity)} per stk
            </p>
          </div>
          <p className="whitespace-nowrap text-base font-semibold text-text sm:text-lg">
            {formatPrice(item.subtotal)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex h-10 items-center overflow-hidden rounded-md border border-border">
            <button
              type="button"
              className={stepperButtonClasses}
              onClick={() => onQuantityChange(item.quantity - 1)}
              disabled={disabled || item.quantity <= 1}
              aria-label={`Reduser antall ${name}`}
            >
              −
            </button>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={item.quantity}
              onChange={(event) => {
                const { value, valueAsNumber } = event.currentTarget;
                // Ignore empty/partial/invalid input (e.g. while the user is
                // retyping) instead of firing a cart mutation with a bogus value
                if (value.trim() === '' || !Number.isFinite(valueAsNumber)) {
                  return;
                }
                // Never remove the line from the input; clamp to a whole number >= 1
                onQuantityChange(Math.max(1, Math.trunc(valueAsNumber)));
              }}
              className="h-full w-12 border-x border-border bg-transparent text-center text-sm text-text focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label={`Antall ${name}`}
            />
            <button
              type="button"
              className={stepperButtonClasses}
              onClick={() => onQuantityChange(item.quantity + 1)}
              disabled={disabled}
              aria-label={`Øk antall ${name}`}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onQuantityChange(0)}
            disabled={disabled}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-error px-3 text-sm font-semibold text-error transition-colors hover:bg-error hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={`Fjern ${name} fra handlekurven`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
            Fjern
          </button>
        </div>
      </div>
    </li>
  );
};

export default CartItem;
