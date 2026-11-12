/**
 * Placeholder rows matching the cart item layout, shown while the cart loads.
 */
const CartSkeleton = () => (
  <div aria-busy="true">
    <span className="sr-only">Laster handlekurv…</span>
    <ul
      className="divide-y divide-border border-y border-border"
      aria-hidden="true"
    >
      {[0, 1].map((row) => (
        <li key={row} className="flex animate-pulse gap-4 py-5">
          <div className="size-20 flex-shrink-0 rounded-md bg-surface-alt sm:size-24" />
          <div className="flex flex-1 flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-surface-alt" />
              <div className="h-3 w-1/3 rounded bg-surface-alt" />
              <div className="h-4 w-1/4 rounded bg-surface-alt" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-10 w-32 rounded-md bg-surface-alt" />
              <div className="h-10 w-20 rounded-md bg-surface-alt" />
            </div>
          </div>
        </li>
      ))}
    </ul>
    <div className="flex animate-pulse justify-between pt-5" aria-hidden="true">
      <div className="h-5 w-20 rounded bg-surface-alt" />
      <div className="h-5 w-28 rounded bg-surface-alt" />
    </div>
  </div>
);

export default CartSkeleton;
