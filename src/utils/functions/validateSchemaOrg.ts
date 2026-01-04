/**
 * Schema.org JSON-LD Validation Utilities
 *
 * Provides runtime validation for schema.org structured data
 * to ensure compliance with Google Rich Results requirements.
 */

/**
 * Validate Product schema structure
 *
 * @param data - Product schema object to validate
 * @returns Validation result with errors array
 */
export function validateProductSchema(data: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!data['@context'] || data['@context'] !== 'https://schema.org') {
    errors.push('@context must be "https://schema.org"');
  }

  if (!data['@type'] || data['@type'] !== 'Product') {
    errors.push('@type must be "Product"');
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Product name is required and must be a string');
  }

  if (!data.offers) {
    errors.push('Product offers is required');
  } else {
    // Validate offers
    if (data.offers['@type'] !== 'Offer') {
      errors.push('offers @type must be "Offer"');
    }

    if (!data.offers.url || typeof data.offers.url !== 'string') {
      errors.push('offers.url is required and must be a valid URL');
    }

    if (
      !data.offers.priceCurrency ||
      typeof data.offers.priceCurrency !== 'string'
    ) {
      errors.push('offers.priceCurrency is required');
    }

    if (!data.offers.price) {
      errors.push('offers.price is required');
    }

    if (
      !data.offers.availability ||
      !data.offers.availability.startsWith('https://schema.org/')
    ) {
      errors.push('offers.availability must be a valid schema.org URL');
    }
  }

  // Validate aggregateRating if present
  if (data.aggregateRating) {
    if (data.aggregateRating['@type'] !== 'AggregateRating') {
      errors.push('aggregateRating @type must be "AggregateRating"');
    }

    if (
      typeof data.aggregateRating.ratingValue !== 'number' ||
      data.aggregateRating.ratingValue < 1 ||
      data.aggregateRating.ratingValue > 5
    ) {
      errors.push('aggregateRating.ratingValue must be between 1 and 5');
    }

    if (
      typeof data.aggregateRating.reviewCount !== 'number' ||
      data.aggregateRating.reviewCount < 1
    ) {
      errors.push('aggregateRating.reviewCount must be a positive number');
    }
  }

  // Validate reviews if present
  if (data.review && Array.isArray(data.review)) {
    data.review.forEach((review: any, index: number) => {
      if (review['@type'] !== 'Review') {
        errors.push(`review[${index}] @type must be "Review"`);
      }

      if (!review.author || review.author['@type'] !== 'Person') {
        errors.push(`review[${index}].author must be a Person`);
      }

      if (!review.reviewRating || review.reviewRating['@type'] !== 'Rating') {
        errors.push(`review[${index}].reviewRating must be a Rating`);
      }

      if (
        review.reviewRating &&
        (typeof review.reviewRating.ratingValue !== 'number' ||
          review.reviewRating.ratingValue < 1 ||
          review.reviewRating.ratingValue > 5)
      ) {
        errors.push(
          `review[${index}].reviewRating.ratingValue must be between 1 and 5`,
        );
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Log validation errors in development mode
 *
 * @param validationResult - Result from validateProductSchema
 * @param productId - Product identifier for logging context
 */
export function logSchemaValidationErrors(
  validationResult: { valid: boolean; errors: string[] },
  productId?: string | number,
): void {
  if (!validationResult.valid && process.env.NODE_ENV === 'development') {
    console.error(
      `[Schema.org Validation] Product ${productId || 'unknown'} has schema errors:`,
      validationResult.errors,
    );
  }
}
