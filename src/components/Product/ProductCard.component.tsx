import Link from 'next/link';
import Image from 'next/image';

interface ProductCardProps {
  databaseId: number;
  name: string;
  price: string;
  slug: string;
  image?: {
    sourceUrl?: string;
  };
}

const ProductCard = ({
  databaseId,
  name,
  price,
  slug,
  image,
}: ProductCardProps) => {
  return (
    <div className="group">
      <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
        <Link href={`/produkt/${slug}?id=${databaseId}`}>
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
