import Link from 'next/link';
import Image from 'next/image';
import { paddedPrice } from '@/utils/functions/functions';

interface ProductCardProps {
  databaseId: number;
  name: string;
  price: string;
  regularPrice: string;
  salePrice?: string;
  onSale: boolean;
  slug: string;
  image?: {
    sourceUrl?: string;
  };
}

const ProductCard = ({
  databaseId,
  name,
  price,
  regularPrice,
  salePrice,
  onSale,
  slug,
  image,
}: ProductCardProps) => {
  // Add padding/empty character after currency symbol
  const formattedPrice = price ? paddedPrice(price, 'kr') : price;
  const formattedRegularPrice = regularPrice ? paddedPrice(regularPrice, 'kr') : regularPrice;
  const formattedSalePrice = salePrice ? paddedPrice(salePrice, 'kr') : salePrice;

  return (
    <div className="group">
      <div className="aspect-[3/4] overflow-hidden bg-surface-alt relative">
        <Link href={`/produkt/${slug}`}>
          {image?.sourceUrl ? (
            <Image
              src={image.sourceUrl}
              alt={name}
              fill
              className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105"
              priority={databaseId === 1}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="h-full w-full bg-surface-alt flex items-center justify-center">
              <span className="text-text-light">No image</span>
            </div>
          )}
        </Link>
      </div>

      <Link href={`/produkt/${slug}`}>
        <div className="mt-4">
          <p className="text-base font-medium text-center cursor-pointer hover:text-primary transition-colors duration-200">
            {name}
          </p>
        </div>
      </Link>
      <div className="mt-2 text-center">
        {onSale ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-bold text-error">{formattedSalePrice}</span>
            <span className="text-lg text-text-light line-through">{formattedRegularPrice}</span>
          </div>
        ) : (
          <span className="text-lg text-text">{formattedPrice}</span>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
