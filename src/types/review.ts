/**
 * Product Review Type Definitions
 *
 * TypeScript interfaces for the review system.
 * Matches GraphQL schema from WordPress backend.
 *
 * @package MEBL
 * @since 1.0.0
 */

/**
 * Product review data structure
 */
export interface ProductReview {
  id: string;
  author: string;
  content: string;
  rating: number; // 1-5
  date: string; // ISO 8601
  verified: boolean;
}

/**
 * Review edge for pagination
 */
export interface ProductReviewEdge {
  node: ProductReview;
  cursor: string;
}

/**
 * Pagination metadata (Relay spec)
 */
export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

/**
 * Review connection for paginated lists
 */
export interface ProductReviewConnection {
  edges: ProductReviewEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

/**
 * Review submission input
 */
export interface SubmitReviewInput {
  productId: number;
  rating: number; // 1-5
  content: string;
  clientMutationId?: string;
}

/**
 * Review submission response
 */
export interface SubmitReviewPayload {
  success: boolean;
  message: string;
  review?: ProductReview | null;
  clientMutationId?: string;
}

/**
 * Review sort options (MVP: RECENT only)
 */
export enum ReviewOrderBy {
  RECENT = 'RECENT',
}
