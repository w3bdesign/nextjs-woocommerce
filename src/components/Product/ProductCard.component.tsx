import Link from 'next/link';
import Image from 'next/image';
import { paddedPrice } from '@/utils/functions/functions';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceGroup } from '@/components/UI/Price.component';
import { TypographyH4 } from '@/components/UI/Typography.component';

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
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {onSale && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 right-2 z-10"
            >
              SALE
            </Badge>
          )}
          <Link href={`/product/${slug}`}>
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
      </CardContent>

      <CardFooter className="flex flex-col items-center p-4 pt-4">
        <Link href={`/product/${slug}`} className="w-full">
          <TypographyH4 className="text-center cursor-pointer hover:text-gray-600 transition-colors mb-2">
            {name}
          </TypographyH4>
        </Link>
        <PriceGroup
          salePrice={onSale ? formattedSalePrice : null}
          regularPrice={onSale ? formattedRegularPrice : formattedPrice}
          size="lg"
        />
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
