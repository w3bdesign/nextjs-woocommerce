// Imports
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Components
import { Container } from '@/components/Layout/Container.component';
import { Skeleton } from '@/components/ui/skeleton';
import { IProductRootObject } from './AddToCart.component';

// Config
import { FAMILY_REGISTRY, getModelFamily } from '@/config/families.registry';

// Utils
import debug from '@/utils/debug';

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
            (() => {
              // Determine whether to use family-based or legacy model-based configuration
              const familyId = product.configurator?.familyId;
              const modelId = product.configurator?.modelId;

              // Debug logging: Show parsed configurator data
              debug.log(
                `[SingleProduct] Configurator data parsed:\n` +
                  `  familyId: ${familyId}\n` +
                  `  modelId: ${modelId}\n` +
                  `  Product: ${product.name} (ID: ${product.databaseId})`,
              );

              // Prefer familyId if available (family-based system)
              if (familyId) {
                debug.log(
                  `[SingleProduct] Attempting to load family: ${familyId}`,
                );
                const family = getModelFamily(familyId);

                if (!family) {
                  // Family ID specified but not found in registry
                  debug.error(
                    `Family ID "${familyId}" not found in FAMILY_REGISTRY. ` +
                      `Product: ${product.name} (ID: ${product.databaseId})\n\n` +
                      `💡 TIP: If you see a model ID like "cabinet-v1" here, you need to:\n` +
                      `   1. Go to WordPress admin → Products → Edit this product\n` +
                      `   2. Find "3D Configurator Settings" in the sidebar\n` +
                      `   3. Change the dropdown from model ID to family ID (e.g., "cabinet-family-01")\n` +
                      `   4. Save the product\n\n` +
                      `Available families: ${Object.keys(FAMILY_REGISTRY).join(', ')}`,
                  );

                  return (
                    <div className="w-full h-[600px] bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
                      <div className="text-center px-4">
                        <p className="text-gray-800 font-semibold mb-2">
                          Configuration Unavailable
                        </p>
                        <p className="text-gray-600 text-sm">
                          The 3D configurator for this product is currently
                          unavailable.
                        </p>
                      </div>
                    </div>
                  );
                }

                // Family found - use family-based configuration
                return (
                  <ProductConfigurator
                    familyId={familyId}
                    productId={product.databaseId}
                    product={product}
                  />
                );
              }

              // Fallback to legacy modelId-based configuration
              if (modelId) {
                debug.log(
                  `Using legacy modelId for product: ${product.name}. ` +
                    `Consider migrating to family-based configuration.`,
                );

                return (
                  <ProductConfigurator
                    modelId={modelId}
                    productId={product.databaseId}
                    product={product}
                  />
                );
              }

              // Neither familyId nor modelId specified
              debug.error(
                `Product configurator enabled but no familyId or modelId specified. ` +
                  `Product: ${product.name} (ID: ${product.databaseId})`,
              );

              return (
                <div className="w-full h-[600px] bg-gray-100 rounded-lg shadow-lg flex items-center justify-center">
                  <p className="text-gray-600">Configuration error</p>
                </div>
              );
            })()
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
