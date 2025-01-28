import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface ProductCardProps {
  databaseId: number;
  name: string;
  price: string;
  slug: string;
  image?: {
    sourceUrl?: string;
  };
}

const ProductCard = ({ databaseId, name, price, slug, image }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group">
      <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute right-4 top-4 z-10 rounded-full bg-white p-2 hover:scale-110 transition-transform duration-200"
        >
          <svg
            className={`h-5 w-5 ${
              isFavorite ? 'fill-red-500' : 'fill-none stroke-gray-600'
            }`}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        <Link href={`/produkt/${slug}?id=${databaseId}`}>
          {image?.sourceUrl ? (
            <Image
              src={image.sourceUrl}
              alt={name}
              fill
              className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="h-full w-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </Link>
      </div>

      <Link href={`/produkt/${slug}?id=${databaseId}`}>
        <div className="mt-4">
          <p className="text-base font-bold text-center cursor-pointer hover:text-gray-600 transition-colors">
            {name}
          </p>
        </div>
      </Link>
      <div className="mt-2 text-center">
        <span className="text-gray-900">{price}</span>
      </div>
    </div>
  );
};

export default ProductCard;
