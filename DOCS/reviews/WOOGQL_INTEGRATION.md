# WooGraphQL Integration – Review System Architecture (MVP)

**Last Updated:** January 3, 2026  
**Status:** Phase 3 Complete - Using Native WooGraphQL Fields Only

---

## Overview

For MVP, we leverage WooGraphQL's native review fields without custom GraphQL extensions. Our plugin provides the backend data pipeline and write API.

**Our plugin provides:**

1. **Data pipeline:** Backend (PHP) that populates `_wc_average_rating` and `_wc_review_count` cache
2. **Write API:** `submitReview` mutation with validation (Phase 4)
3. **Business logic:** Rate limiting, duplicate prevention, verified purchase badges

**For MVP:** Zero custom GraphQL fields. WooGraphQL's native schema is sufficient.

---

## WooGraphQL Native Fields

| Field            | Type                         | Source                    | Description                 |
| ---------------- | ---------------------------- | ------------------------- | --------------------------- |
| `reviews`        | `ProductToCommentConnection` | WordPress `wp_comments`   | Paginated review list       |
| `reviewsAllowed` | `Boolean`                    | `comment_status`          | Whether reviews are enabled |
| `averageRating`  | `Float`                      | `_wc_average_rating` meta | Average rating (1.0-5.0)    |
| `reviewCount`    | `Int`                        | `_wc_review_count` meta   | Total approved reviews      |

### Example Query

```graphql
query GetProductReviews {
  product(id: "cG9zdDoxMjM=", idType: DATABASE_ID) {
    name
    reviewsAllowed
    averageRating
    reviewCount
    reviews(first: 10) {
      nodes {
        databaseId
        author {
          node {
            name
          }
        }
        content
        date
      }
    }
  }
}
```

---

## Data Flow

### Read Path (Query)

```
Frontend (Apollo Client)
    ↓
WPGraphQL Layer
    ↓
WooGraphQL Native Resolvers
    ↓
WordPress Database
  - wp_comments (comment_type='review')
  - wp_postmeta (_wc_average_rating, _wc_review_count)
```

### Write Path (Mutation - Phase 4)

```
Frontend submitReview Mutation
    ↓
MEBL Review Bridge Plugin
  1. Validate input
  2. Check rate limits
  3. Insert wp_comments
  4. Add commentmeta (rating, verified)
    ↓
WordPress Hooks (comment_post, transition_comment_status)
    ↓
class-rating-aggregator.php
  - Recalculate _wc_average_rating
  - Recalculate _wc_review_count
    ↓
WooGraphQL Resolvers (automatically reflect updated data)
```

---

## Backend Components

### Phase 1: Storage & Aggregation

| File                          | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `class-review-storage.php`    | Insert reviews into wp_comments                |
| `class-rating-aggregator.php` | Calculate and cache averageRating, reviewCount |

**Data Structure:**

```
wp_comments:
  - comment_post_ID: (product ID)
  - comment_type: 'review'
  - comment_approved: '0' or '1'
  - comment_content: (review text)

wp_commentmeta:
  - rating: 1-5 (integer)
  - verified: 1 or 0
  - helpful: (Phase 2 feature)

wp_postmeta (product):
  - _wc_average_rating: 4.2 (float)
  - _wc_review_count: 15 (int)
```

### Phase 2: Hooks & Cache Management

| File                          | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `class-review-hooks.php`      | Listen to WordPress comment hooks, trigger cache updates |
| `class-review-validation.php` | Validate mutation inputs (Phase 4)                       |

**Hook Flow:**

1. Admin approves review → `transition_comment_status` fires
2. `class-review-hooks.php` detects change
3. Triggers `class-rating-aggregator.php`
4. Updates `_wc_average_rating` and `_wc_review_count`
5. WooGraphQL immediately reflects new values

---

## Frontend Integration

### TypeScript Types

```typescript
// src/types/product.ts
export interface Product {
  // ... other fields
  reviewsAllowed?: boolean;
  averageRating?: number | null;
  reviewCount?: number;
  reviews?: ProductReviewConnection;
}

// src/types/review.ts
export interface ProductReview {
  id: string;
  author: string;
  content: string;
  rating: number;
  date: string;
  verified: boolean;
}
```

### GraphQL Query Usage

```typescript
// src/utils/gql/GQL_QUERIES.ts
export const GET_PRODUCT_REVIEWS = gql`
  query GetProductReviews($slug: ID!, $first: Int = 10, $after: String) {
    product(id: $slug, idType: SLUG) {
      id
      name
      reviewsAllowed
      averageRating
      reviewCount
      reviews(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          databaseId
          date
          content
          author {
            node {
              name
            }
          }
        }
      }
    }
  }
`;
```

---

## Phase 3 Checklist

- [x] **Verified WooGraphQL provides all needed fields**
  - reviews, reviewsAllowed, averageRating, reviewCount are native
- [x] **Removed duplicate field registrations**
  - No custom GraphQL types needed for MVP
- [x] **Verified backend cache population**
  - Phase 1 aggregator writes to `_wc_average_rating` and `_wc_review_count`
  - WooGraphQL reads from these meta keys
- [x] **Updated documentation**
  - EXECUTION_INDEX.md reflects MVP scope
  - This integration guide simplified

---

## Phase 4 Preview (Next Steps)

### submitReview Mutation Schema

```graphql
mutation SubmitReview($input: SubmitReviewInput!) {
  submitReview(input: $input) {
    success
    message
    review {
      id
      author
      content
      rating
      date
      verified
    }
  }
}
```

### Implementation Requirements

1. Use existing `class-review-validation.php` for input validation
2. Use existing `class-review-storage.php` for data persistence
3. Return `ProductReview` type (custom, not WooGraphQL Comment type)
4. Test mutation triggers aggregation hooks automatically

---

## Validation Checklist

Before adding new review-related features:

### 1. Check WooGraphQL Schema First

Run in GraphiQL (`/graphql`):

```graphql
query IntrospectProductFields {
  __type(name: "Product") {
    fields {
      name
      type {
        name
        kind
      }
      description
    }
  }
}
```

### 2. Avoid Duplication

**DO NOT register these fields** (WooGraphQL provides them):

- `reviews` (ProductToCommentConnection)
- `reviewsAllowed` (Boolean)
- `averageRating` (Float)
- `reviewCount` (Int)
- `commentCount` (Int)
- `commentStatus` (String)

### 3. Test for Conflicts

Check debug log for warnings:

```
[GraphQL] Warning: The field 'fieldName' already exists on the type 'Product'
```

---

## Troubleshooting

### Issue: averageRating Returns Null

**Debug Steps:**

1. Check `_wc_average_rating` meta exists:
   ```sql
   SELECT * FROM wp_postmeta WHERE meta_key = '_wc_average_rating' AND post_id = 123;
   ```
2. Verify Phase 1 aggregator runs on review approval
3. Check Phase 2 hooks are active

### Issue: reviews Connection Empty

**Possible Causes:**

- No approved reviews (`comment_approved = '1'`)
- Reviews not tagged with `comment_type = 'review'`
- WooGraphQL plugin not activated

**Solution:**

```bash
wp plugin list | grep woocommerce
wp plugin activate wp-graphql-woocommerce
```

---

## Performance Notes

### Cache Efficiency

- `averageRating` and `reviewCount` read from meta (no comment queries)
- Cost: ~0.1ms per product query
- No additional database queries per request

### Review Connection Pagination

Always use `first` argument to limit results:

```graphql
reviews(first: 10) {
  pageInfo { hasNextPage endCursor }
  nodes { ... }
}
```

For products with 1000+ reviews, pagination is essential.

---

## References

- **WooGraphQL Docs:** [wpgraphql.com/docs/woocommerce](https://docs.wpgraphql.com/extensions/wpgraphql-woocommerce/)
- **Spec:** `DOCS/reviews/specs/part-3.md`
- **Execution Index:** `DOCS/reviews/EXECUTION_INDEX.md`
- **Plugin Code:** `wordpress/mebl-review-bridge/`
- **Frontend Queries:** `src/utils/gql/GQL_QUERIES.ts`
