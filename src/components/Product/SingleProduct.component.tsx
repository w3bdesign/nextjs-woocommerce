// Imports
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Components
import { Container } from '@/components/Layout/Container.component';
import { Skeleton } from '@/components/ui/skeleton';
import { IProductRootObject } from './AddToCart.component';

// Dynamically import 3D configurator to avoid SSR issues
const ProductConfigurator = dynamic(
  () => import('@/components/Configurator/ProductConfigurator.component'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[750px] flex items-center justify-center bg-gray-100 rounded-lg">
        <Skeleton className="w-full h-full" />
      </div>
    ),
  },
);

const SingleProduct = ({ product }: IProductRootObject) => {
  const [_selectedVariation, setSelectedVariation] = useState<number>();

  useEffect(() => {
    if (product.variations) {
      const firstVariant = product.variations.nodes[0].databaseId;
      setSelectedVariation(firstVariant);
    }
  }, [product.variations]);

  return (
    <section className="bg-white mb-[8rem] md:mb-12">
      <Container paddingClassName="px-4 py-8">
        {/* Configurator takes full width */}
        <div className="mb-6 md:mb-0">
          {product.configurator?.enabled ? (
            <ProductConfigurator
              modelId={product.configurator.modelId}
              product={product}
            />
          ) : (
            <div className="max-w-xl mx-auto aspect-[3/4] relative overflow-hidden bg-gray-100">
              <img
                src={product.image?.sourceUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default SingleProduct;
