import { TypographyH2 } from '@/components/ui/Typography.component';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product } from '@/types/product';
import React from 'react';
import { ReviewForm } from './ReviewForm.component';
import { ReviewList } from './ReviewList.component';
import { ReviewSummary } from './ReviewSummary.component';

interface ProductReviewsProps {
  product: Product;
  isAuthenticated: boolean;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  product,
  isAuthenticated,
}) => {
  if (!product.reviewsAllowed) {
    return null;
  }

  const hasReviews = (product.reviewCount ?? 0) > 0;
  const reviewCount = product.reviewCount ?? 0;

  return (
    <section className="mt-16" id="reviews">
      <TypographyH2 className="mb-6">Customer Reviews</TypographyH2>

      {hasReviews && product.averageRating != null && (
        <>
          <ReviewSummary
            averageRating={product.averageRating}
            reviewCount={reviewCount}
          />
          <Separator className="my-8" />
        </>
      )}

      <Tabs defaultValue={hasReviews ? 'all' : 'write'} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="all">
            All Reviews{hasReviews && ` (${reviewCount})`}
          </TabsTrigger>
          <TabsTrigger value="write">Write a Review</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ReviewList
            productSlug={product.slug}
            initialReviews={
              product.reviews?.edges?.map((edge) => edge.node) || []
            }
            initialHasMore={product.reviews?.pageInfo?.hasNextPage || false}
          />
        </TabsContent>

        <TabsContent value="write">
          <ReviewForm
            productId={product.databaseId}
            productSlug={product.slug}
            isAuthenticated={isAuthenticated}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
};
