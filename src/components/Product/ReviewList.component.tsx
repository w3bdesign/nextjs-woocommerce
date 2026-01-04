import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TypographyP } from '@/components/ui/Typography.component';
import { GET_PRODUCT_REVIEWS } from '@/utils/gql/GET_PRODUCT_REVIEWS';
import { useQuery } from '@apollo/client';
import { AlertCircle } from 'lucide-react';
import React from 'react';
import { ReviewCard } from './ReviewCard.component';

interface ReviewListProps {
  productSlug: string;
  initialReviews?: any[];
  initialHasMore?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  productSlug,
  initialReviews = [],
  initialHasMore = false,
}) => {
  const { data, loading, error, fetchMore } = useQuery(GET_PRODUCT_REVIEWS, {
    variables: {
      slug: productSlug,
      first: 10,
    },
    skip: typeof window === 'undefined' || initialReviews.length > 0, // Skip during SSR or if SSR data available
  });

  // Debug: Log GraphQL response
  console.log(
    '[REVIEW_LIST] GraphQL data:',
    JSON.stringify(data?.product?.reviews, null, 2),
  );
  console.log(
    '[REVIEW_LIST] Initial reviews:',
    JSON.stringify(initialReviews, null, 2),
  );

  const reviews =
    data?.product?.reviews?.edges?.map((edge: any) => edge.node) ||
    initialReviews;
  const pageInfo = data?.product?.reviews?.pageInfo;
  const hasNextPage = pageInfo?.hasNextPage ?? initialHasMore;

  const handleLoadMore = () => {
    if (!pageInfo?.endCursor) return;

    fetchMore({
      variables: {
        after: pageInfo.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          ...fetchMoreResult,
          product: {
            ...fetchMoreResult.product,
            reviews: {
              ...fetchMoreResult.product.reviews,
              edges: [
                ...(prev.product?.reviews?.edges || []),
                ...(fetchMoreResult.product?.reviews?.edges || []),
              ],
            },
          },
        };
      },
    });
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load reviews. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (reviews.length === 0 && !loading) {
    return (
      <Card className="bg-muted/50">
        <CardContent className="py-12 text-center">
          <TypographyP className="text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </TypographyP>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Review Cards */}
      <div className="space-y-0">
        {reviews.map((review: any) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 mt-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasNextPage && !loading && (
        <div className="mt-6 text-center">
          <Button onClick={handleLoadMore} variant="outline">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
};
