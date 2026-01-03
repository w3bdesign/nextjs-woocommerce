## Part 5: Frontend Integration and SSR/SEO Considerations

> **MVP Scope:** Rating histogram UI removed. Focus on essential review display and submission.

### 5.1 React Component Architecture

**Component Hierarchy (MVP):**

```
ProductPage (src/pages/product/[slug].tsx)
  └── ProductReviews.component.tsx
        ├── ReviewSummary.component.tsx (simplified - no histogram)
        │     └── StarRating.component.tsx
        ├── ReviewList.component.tsx
        │     └── ReviewCard.component.tsx
        │           ├── StarRating.component.tsx
        │           └── VerifiedBadge.component.tsx
        └── ReviewForm.component.tsx
              ├── StarRatingInput.component.tsx
              └── TextAreaInput.component.tsx
```

### 5.2 Component Implementation

#### Star Rating Component (Reusable)

**File: `src/components/Product/StarRating.component.tsx`**

```typescript
import React from 'react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number; // 0-5, supports decimals (e.g., 4.5)
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
      const filled = Math.min(Math.max(rating - (i - 1), 0), 1);

      stars.push(
        <div key={i} className="relative inline-block">
          {/* Empty star background */}
          <svg
            className={cn(sizeClasses[size], 'text-gray-300')}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>

          {/* Filled star overlay */}
          {filled > 0 && (
            <svg
              className={cn(
                sizeClasses[size],
                'absolute top-0 left-0 text-yellow-400'
              )}
              style={{ clipPath: `inset(0 ${(1 - filled) * 100}% 0 0)` }}
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
        </div>
      );
    }
    return stars;
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex" role="img" aria-label={`${rating} out of ${maxRating} stars`}>
        {renderStars()}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
```

#### Review Summary Component (MVP - Simplified)

**File: `src/components/Product/ReviewSummary.component.tsx`**

```typescript
import React from 'react';
import { StarRating } from './StarRating.component';
import { TypographyH3, TypographyP } from '@/components/ui/Typography.component';

interface ReviewSummaryProps {
  averageRating: number;
  reviewCount: number;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  reviewCount,
}) => {
  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <div className="flex flex-col items-center text-center">
        <div className="text-5xl font-bold text-gray-900 mb-2">
          {averageRating.toFixed(1)}
        </div>
        <StarRating rating={averageRating} size="lg" />
        <TypographyP className="text-sm text-gray-600 mt-2">
          Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </TypographyP>
      </div>
    </div>
  );
};
```

> **MVP Note:** Rating histogram UI removed. For post-MVP, can add bar chart showing distribution of 1-5 star ratings.

#### Review Card Component

**File: `src/components/Product/ReviewCard.component.tsx`**

```typescript
import React from 'react';
import { ProductReview } from '@/types/review';
import { StarRating } from './StarRating.component';
import { TypographyP } from '@/components/ui/Typography.component';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';

interface ReviewCardProps {
  review: ProductReview;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <article className="border-b py-6 last:border-b-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{review.author}</span>
            {review.verified && (
              <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Verified Purchase
              </Badge>
            )}
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
        <time
          dateTime={review.date}
          className="text-sm text-gray-500"
        >
          {formatDate(review.date)}
        </time>
      </div>

      {/* Content */}
      <TypographyP className="text-gray-700 whitespace-pre-line">
        {review.content}
      </TypographyP>

      {/* Footer (Helpful votes - Phase 2) */}
      {review.helpful && review.helpful > 0 && (
        <div className="mt-3 text-sm text-gray-500">
          {review.helpful} {review.helpful === 1 ? 'person' : 'people'} found this helpful
        </div>
      )}
    </article>
  );
};
```

#### Review List Component with Pagination

**File: `src/components/Product/ReviewList.component.tsx`**

```typescript
import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_REVIEWS } from '@/utils/gql/GET_PRODUCT_REVIEWS';
import { ReviewCard } from './ReviewCard.component';
import { ProductReview, ReviewOrderBy } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReviewListProps {
  productSlug: string;
  initialReviews?: ProductReview[];
  initialHasMore?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({
  productSlug,
  initialReviews = [],
  initialHasMore = false,
}) => {
  const [orderBy, setOrderBy] = useState<ReviewOrderBy>(ReviewOrderBy.RECENT);

  const { data, loading, error, fetchMore } = useQuery(GET_PRODUCT_REVIEWS, {
    variables: {
      slug: productSlug,
      first: 10,
      orderBy,
    },
    skip: initialReviews.length === 0, // Skip if SSR data available
  });

  const reviews = data?.product?.reviews?.edges?.map((edge: any) => edge.node) || initialReviews;
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
          product: {
            ...prev.product,
            reviews: {
              ...fetchMoreResult.product.reviews,
              edges: [
                ...prev.product.reviews.edges,
                ...fetchMoreResult.product.reviews.edges,
              ],
            },
          },
        };
      },
    });
  };

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load reviews. Please try again.
      </div>
    );
  }

  if (reviews.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Showing {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </div>
        <Select
          value={orderBy}
          onValueChange={(value) => setOrderBy(value as ReviewOrderBy)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ReviewOrderBy.RECENT}>Most Recent</SelectItem>
            <SelectItem value={ReviewOrderBy.HIGHEST_RATED}>Highest Rated</SelectItem>
            <SelectItem value={ReviewOrderBy.MOST_HELPFUL}>Most Helpful</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Review Cards */}
      <div className="space-y-0">
        {reviews.map((review: ProductReview) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6 mt-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasNextPage && !loading && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
          >
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
};
```

#### Review Form Component

**File: `src/components/Product/ReviewForm.component.tsx`**

```typescript
import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { SUBMIT_REVIEW } from '@/utils/gql/SUBMIT_REVIEW';
import { GET_PRODUCT_REVIEWS } from '@/utils/gql/GET_PRODUCT_REVIEWS';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  productId: number;
  productSlug: string;
  isAuthenticated: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  productSlug,
  isAuthenticated,
}) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [content, setContent] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const [submitReview, { loading }] = useMutation(SUBMIT_REVIEW, {
    refetchQueries: [
      { query: GET_PRODUCT_REVIEWS, variables: { slug: productSlug } },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a star rating.',
        variant: 'destructive',
      });
      return;
    }

    if (content.trim().length < 10) {
      toast({
        title: 'Review Too Short',
        description: 'Please write at least 10 characters.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data } = await submitReview({
        variables: {
          input: {
            productId,
            rating,
            content: content.trim(),
          },
        },
      });

      if (data?.submitReview?.success) {
        setSubmitted(true);
        setRating(0);
        setContent('');
        toast({
          title: 'Review Submitted',
          description: data.submitReview.message,
        });
      } else {
        toast({
          title: 'Submission Failed',
          description: data?.submitReview?.message || 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You must be <a href="/login" className="underline">logged in</a> to submit a review.
        </AlertDescription>
      </Alert>
    );
  }

  if (submitted) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Thank you! Your review has been submitted and is awaiting moderation.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border rounded-lg p-6 bg-gray-50">
      {/* Star Rating Input */}
      <div>
        <Label htmlFor="rating" className="block mb-2">
          Your Rating <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={cn(
                  'w-8 h-8 transition-colors',
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            You rated this product {rating} {rating === 1 ? 'star' : 'stars'}
          </p>
        )}
      </div>

      {/* Review Content */}
      <div>
        <Label htmlFor="content" className="block mb-2">
          Your Review <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={6}
          maxLength={5000}
          className="resize-none"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          {content.length} / 5000 characters
          {content.length < 10 && content.length > 0 && (
            <span className="text-red-500 ml-2">
              (Minimum 10 characters)
            </span>
          )}
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading || rating === 0 || content.trim().length < 10}
        className="w-full"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};
```

#### Main Product Reviews Component

**File: `src/components/Product/ProductReviews.component.tsx`**

```typescript
import React from 'react';
import { Product } from '@/types/product';
import { ReviewSummary } from './ReviewSummary.component';
import { ReviewList } from './ReviewList.component';
import { ReviewForm } from './ReviewForm.component';
import { TypographyH2 } from '@/components/ui/Typography.component';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const hasReviews = product.reviewCount > 0;

  return (
    <section className="mt-16" id="reviews">
      <TypographyH2 className="mb-6">Customer Reviews</TypographyH2>

      {/* Review Summary */}
      {hasReviews && product.averageRating && (
        <ReviewSummary
          averageRating={product.averageRating}
          reviewCount={product.reviewCount}
        />
      )}

      <Separator className="my-8" />

      {/* Tabs: Reviews List / Write Review */}
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="reviews">
            All Reviews ({product.reviewCount})
          </TabsTrigger>
          <TabsTrigger value="write">Write a Review</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6">
          <ReviewList
            productSlug={product.slug}
            initialReviews={product.reviews?.edges?.map((edge) => edge.node) || []}
            initialHasMore={product.reviews?.pageInfo?.hasNextPage}
          />
        </TabsContent>

        <TabsContent value="write" className="mt-6">
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
```

### 5.3 Product Page Integration with SSR

**File: `src/pages/product/[slug].tsx`**

```typescript
import { GetServerSideProps } from 'next';
import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { initializeApollo } from '@/utils/apollo/ApolloClient';
import { GET_PRODUCT_REVIEWS } from '@/utils/gql/GET_PRODUCT_REVIEWS';
import { Product } from '@/types/product';
import { ProductReviews } from '@/components/Product/ProductReviews.component';
import { Layout } from '@/components/Layout/Layout.component';
import { SingleProduct } from '@/components/Product/SingleProduct.component';
import { BreadcrumbNav } from '@/components/Layout/BreadcrumbNav.component';
import { getAuthToken } from '@/utils/auth';

interface ProductPageProps {
  product: Product;
  isAuthenticated: boolean;
}

export default function ProductPage({ product, isAuthenticated }: ProductPageProps) {
  return (
    <Layout>
      <BreadcrumbNav
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: product.name },
        ]}
      />

      <SingleProduct product={product} />

      {/* Review Section (SEO-optimized, SSR) */}
      <ProductReviews product={product} isAuthenticated={isAuthenticated} />
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { slug } = context.params as { slug: string };
  const apolloClient: ApolloClient<NormalizedCacheObject> = initializeApollo();

  try {
    // Fetch product with reviews
    const { data } = await apolloClient.query({
      query: GET_PRODUCT_REVIEWS,
      variables: {
        slug,
        first: 10, // Initial page of reviews
      },
    });

    if (!data?.product) {
      return { notFound: true };
    }

    // Check authentication status
    const token = getAuthToken(context.req);
    const isAuthenticated = !!token;

    return {
      props: {
        product: data.product,
        isAuthenticated,
        // Apollo cache serialization for client hydration
        initialApolloState: apolloClient.cache.extract(),
      },
    };
  } catch (error) {
    console.error('Product page error:', error);
    return { notFound: true };
  }
};
```

### 5.4 SEO Optimization

#### Structured Data (JSON-LD)

**File: `src/components/Product/ProductStructuredData.component.tsx`**

```typescript
import React from 'react';
import Head from 'next/head';
import { Product } from '@/types/product';

interface ProductStructuredDataProps {
  product: Product;
  reviews?: any[]; // First page of reviews for schema
}

export const ProductStructuredData: React.FC<ProductStructuredDataProps> = ({
  product,
  reviews = [],
}) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image?.sourceUrl,
    description: product.description,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      url: `https://yourdomain.com/product/${product.slug}`,
      priceCurrency: 'PLN',
      price: parseFloat(product.price?.replace(/[^\d.]/g, '') || '0'),
      availability: product.stockStatus === 'IN_STOCK'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  // Add aggregate rating if reviews exist
  if (product.averageRating && product.reviewCount > 0) {
    structuredData['aggregateRating'] = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add individual reviews (first 5 for schema)
  if (reviews.length > 0) {
    structuredData['review'] = reviews.slice(0, 5).map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      datePublished: review.date,
      reviewBody: review.content,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
    }));
  }

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  );
};
```

**Integration in Product Page:**

```typescript
// In ProductPage component
<ProductStructuredData
  product={product}
  reviews={product.reviews?.edges?.map((edge) => edge.node)}
/>
```

#### Meta Tags for Social Sharing

```typescript
// In ProductPage component (Head section)
<Head>
  <title>{product.name} - Customer Reviews</title>
  <meta name="description" content={`Read ${product.reviewCount} customer reviews for ${product.name}. Average rating: ${product.averageRating?.toFixed(1)}/5.`} />

  {/* Open Graph */}
  <meta property="og:title" content={product.name} />
  <meta property="og:description" content={product.description} />
  <meta property="og:image" content={product.image?.sourceUrl} />
  <meta property="og:type" content="product" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={product.name} />
  <meta name="twitter:description" content={product.description} />
  <meta name="twitter:image" content={product.image?.sourceUrl} />
</Head>
```

### 5.5 Apollo Client Configuration

**Update: `src/utils/apollo/ApolloClient.js`**

```javascript
import { ApolloClient, InMemoryCache, from, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';

// Error handling
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Path: ${path}`);
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// HTTP link
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  credentials: 'include',
});

// Auth middleware (existing)
const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== 'undefined' ? sessionStorage.getItem('auth-token') : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Cache configuration with review-specific policies
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        product: {
          // Cache products by slug
          keyArgs: ['id', 'idType'],
        },
      },
    },
    Product: {
      fields: {
        reviews: {
          // Merge paginated reviews
          keyArgs: ['orderBy'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;

            // If cursor changed, append new edges
            if (args?.after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            }

            // Otherwise, replace (e.g., sort order changed)
            return incoming;
          },
        },
        averageRating: {
          // Always read fresh average rating (critical data)
          read(cached) {
            return cached;
          },
        },
      },
    },
  },
});

export function initializeApollo(initialState = null) {
  const client = new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: from([errorLink, authLink, httpLink]),
    cache,
  });

  // Restore cache from SSR
  if (initialState) {
    client.cache.restore(initialState);
  }

  return client;
}
```

### 5.6 Accessibility Patterns

**ARIA Labels and Roles:**

```typescript
// Star rating component
<div role="img" aria-label={`${rating} out of 5 stars`}>
  {renderStars()}
</div>

// Review form
<form onSubmit={handleSubmit} aria-label="Submit product review">
  <Label htmlFor="rating">
    Your Rating <span aria-label="required">*</span>
  </Label>

  <button
    type="button"
    onClick={() => setRating(star)}
    aria-label={`Rate ${star} stars`}
    aria-pressed={star <= rating}
  >
    <Star />
  </button>
</form>

// Review list
<section aria-labelledby="reviews-heading">
  <h2 id="reviews-heading">Customer Reviews</h2>
  {reviews.map((review) => (
    <article key={review.id} aria-label={`Review by ${review.author}`}>
      {/* Review content */}
    </article>
  ))}
</section>
```

**Keyboard Navigation:**

```typescript
// Star rating input with keyboard support
const handleKeyDown = (e: React.KeyboardEvent, star: number) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    setRating(star);
  }

  // Arrow key navigation
  if (e.key === 'ArrowRight' && star < 5) {
    setRating(star + 1);
  }
  if (e.key === 'ArrowLeft' && star > 1) {
    setRating(star - 1);
  }
};

<button
  type="button"
  onClick={() => setRating(star)}
  onKeyDown={(e) => handleKeyDown(e, star)}
  tabIndex={0}
>
  <Star />
</button>
```

**Screen Reader Announcements:**

```typescript
import { useEffect } from 'react';

// Announce review submission success
useEffect(() => {
  if (submitted) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = 'Your review has been submitted successfully.';
    document.body.appendChild(announcement);

    setTimeout(() => document.body.removeChild(announcement), 1000);
  }
}, [submitted]);
```

### 5.7 Performance Optimization

**Lazy Loading Components:**

```typescript
// In product page
import dynamic from 'next/dynamic';

const ProductReviews = dynamic(
  () => import('@/components/Product/ProductReviews.component').then((mod) => mod.ProductReviews),
  {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: true, // Enable SSR for SEO
  }
);
```

**Image Optimization:**

```typescript
import Image from 'next/image';

// In review card (if image uploads in Phase 2)
<Image
  src={review.imageUrl}
  alt={`Review image by ${review.author}`}
  width={150}
  height={150}
  loading="lazy"
  placeholder="blur"
/>
```

**Debounced Review Fetching:**

```typescript
import { useDebounce } from '@/hooks/useDebounce';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    refetch({ search: debouncedSearch });
  }
}, [debouncedSearch, refetch]);
```

### 5.8 User Experience Flows

**Flow 1: First-Time Reviewer**

```
1. User views product page
2. Scrolls to reviews section (anchor link from header)
3. Sees "Write a Review" tab
4. Clicks tab → Review form appears
5. Selects star rating (hover preview)
6. Types review text (character counter updates)
7. Clicks "Submit Review"
8. Success message: "Thank you! Awaiting moderation"
9. Form resets, switches to "All Reviews" tab
```

**Flow 2: Returning Customer (Already Reviewed)**

```
1. User attempts to submit second review
2. GraphQL mutation validation fails
3. Error toast: "You have already reviewed this product"
4. Form remains visible but submit button disabled
5. User can view their existing review in list
```

**Flow 3: Guest User**

```
1. Guest views product page
2. Sees reviews list (public)
3. Clicks "Write a Review" tab
4. Alert banner: "You must be logged in to submit a review"
5. Click "logged in" link → Redirects to /login?redirect=/product/slug
6. After login → Returns to product page
7. Review form now accessible
```

**Flow 4: Review Moderation**

```
1. Admin receives email notification (optional)
2. Logs into WordPress admin
3. Navigates to Comments → Filter: "Product Reviews"
4. Sees pending reviews with rating/verified columns
5. Bulk selects reviews → "Approve Reviews"
6. Product cache auto-updates (average rating recalculated)
7. Frontend users see new reviews on next page load
```

---

**End of Part 5**

✅ React component architecture defined  
✅ Complete component implementations (StarRating, ReviewCard, ReviewForm, etc.)  
✅ Product page SSR integration documented  
✅ SEO optimization (structured data, meta tags) implemented  
✅ Apollo Client cache policies configured  
✅ Accessibility patterns established (ARIA, keyboard nav, screen readers)  
✅ Performance optimizations specified (lazy loading, debouncing)  
✅ User experience flows mapped

---
