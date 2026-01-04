import { siteConfig } from '@/config/site';
import { Product } from '@/types/product';
import { ProductReview } from '@/types/review';
import {
  formatSchemaPrice,
  mapStockStatusToSchema,
} from '@/utils/functions/formatSchemaPrice';
import {
  logSchemaValidationErrors,
  validateProductSchema,
} from '@/utils/functions/validateSchemaOrg';
import Head from 'next/head';
import React from 'react';

interface SchemaOrgPerson {
  '@type': 'Person';
  name: string;
}

interface SchemaOrgRating {
  '@type': 'Rating';
  ratingValue: number;
  bestRating: number;
  worstRating: number;
}

interface SchemaOrgReview {
  '@type': 'Review';
  author: SchemaOrgPerson;
  datePublished: string;
  reviewBody: string;
  reviewRating: SchemaOrgRating;
}

interface SchemaOrgAggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
}

interface SchemaOrgOffer {
  '@type': 'Offer';
  url: string;
  priceCurrency: string;
  price: string;
  availability: string;
}

interface SchemaOrgProduct {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description?: string;
  image?: string;
  sku?: string;
  offers: SchemaOrgOffer;
  aggregateRating?: SchemaOrgAggregateRating;
  review?: SchemaOrgReview[];
}

interface ProductStructuredDataProps {
  product: Product;
  reviews?: ProductReview[];
}

/**
 * ProductStructuredData Component
 * Generates JSON-LD structured data for product pages with reviews
 * Enables Google Rich Results for product ratings and reviews
 */
export const ProductStructuredData: React.FC<ProductStructuredDataProps> = ({
  product,
  reviews = [],
}) => {
  const structuredData: SchemaOrgProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    offers: {
      '@type': 'Offer',
      url: `${siteConfig.url}/product/${product.slug}`,
      priceCurrency: 'PLN',
      price: formatSchemaPrice(product.price),
      availability: mapStockStatusToSchema(product.stockStatus),
    },
  };

  // Add description only if present
  if (product.description) {
    structuredData.description = product.description;
  }

  // Add image only if present
  if (product.image?.sourceUrl) {
    structuredData.image = product.image.sourceUrl;
  }

  // Add SKU only if present
  if (product.sku) {
    structuredData.sku = product.sku;
  }

  // Add aggregate rating if reviews exist
  if (product.averageRating && product.reviewCount && product.reviewCount > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add individual reviews (first 5 for schema)
  // Only include reviews with valid ratings (per Google policy against misleading data)
  // Note: Reviews are pre-filtered by Phase 5 to only include approved reviews
  if (reviews.length > 0) {
    const reviewsWithRatings = reviews
      .filter((review) => review.rating && review.rating > 0)
      .slice(0, 5);

    if (reviewsWithRatings.length > 0) {
      structuredData.review = reviewsWithRatings.map((review) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author?.node?.name || 'Anonymous',
        },
        datePublished: review.date,
        reviewBody: review.content,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating!,
          bestRating: 5,
          worstRating: 1,
        },
      }));
    }
  }

  // Validate schema in development mode
  if (process.env.NODE_ENV === 'development') {
    const validation = validateProductSchema(structuredData);
    logSchemaValidationErrors(validation, product.databaseId);
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
