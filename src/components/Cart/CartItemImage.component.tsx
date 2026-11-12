import Image from 'next/image';

interface ICartItemImageProps {
  src?: string | null;
  alt: string;
}

/**
 * Cart line thumbnail. Shows a neutral image icon when the product has no image,
 * instead of requesting a fallback file.
 */
const CartItemImage = ({ src, alt }: ICartItemImageProps) => (
  <div className="relative size-20 flex-shrink-0 overflow-hidden rounded-md bg-surface-alt sm:size-24">
    {src ? (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 640px) 96px, 80px"
        className="object-cover"
      />
    ) : (
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
          aria-label={alt}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
        </svg>
      </div>
    )}
  </div>
);

export default CartItemImage;
