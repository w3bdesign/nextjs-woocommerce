## Part 1: Architecture Recap and Scope Definition

### 1.1 Architectural Decision Summary

**Selected Approach:** WordPress/WooCommerce Native Reviews exposed via GraphQL

**Rejected Alternatives:**

- ❌ **Custom Backend in This Repository** — Rejected due to data duplication complexity, need to sync product/order/user data between systems, and 3-5 engineer-weeks overhead vs. 1 week for WordPress extension
- ❌ **Dedicated Microservice (SaaS)** — Rejected due to vendor lock-in, 200-500ms SSR latency impact, limited customization control, and premature optimization (not multi-brand/geo yet)

**Core Rationale:**

1. **Data Ownership:** Reviews naturally belong with products in WooCommerce. Verified purchase validation requires order data already in `woocommerce_order_items` table.
2. **Existing Infrastructure:** Platform already queries `averageRating` and `reviewCount` GraphQL fields (currently unused) — minimal integration cost.
3. **Proven Scalability:** WordPress `wp_comments` table handles 100k+ reviews per product with proper indexing.
4. **Moderation Tooling:** WooCommerce native admin UI (`/wp-admin/edit-comments.php`) provides spam filtering, approval workflows without building custom dashboard.
5. **SEO Alignment:** Next.js SSR on product pages (`getServerSideProps`) can include reviews in initial HTML for Google Rich Snippets.

### 1.2 System Boundaries

**WordPress/WooCommerce Responsibilities:**

- Store review data in `wp_comments` and `wp_commentmeta` tables
- Validate verified purchase status via `wc_customer_bought_product()` function
- Provide moderation interface via WordPress admin dashboard
- Expose reviews via WPGraphQL schema extensions
- Calculate and cache aggregate ratings (`_wc_average_rating`, `_wc_review_count`)
- Handle spam prevention via WordPress core comment filters

**Custom Plugin (`mebl-review-bridge`) Responsibilities:**

- Register GraphQL types: `ProductReview`, `ProductReviewConnection`
- Extend WooCommerce product types (`SimpleProduct`, `VariableProduct`) with `reviews` field
- Implement `submitReview` GraphQL mutation
- Validate review submissions (rating range, content length, duplicate prevention)
- Bridge WooCommerce comment system to GraphQL schema
- Manage review metadata (`rating`, `verified`, `helpful` counts)

**Next.js Frontend Responsibilities:**

- Fetch reviews via Apollo Client during SSR (`getServerSideProps`)
- Render review list with pagination
- Provide review submission form with validation
- Handle authentication state for review submission
- Display aggregate ratings on product cards and product pages
- Implement client-side optimistic UI updates
- Generate structured data (JSON-LD) for SEO

**Apollo Client Middleware Responsibilities:**

- Inject WooCommerce session tokens (already implemented)
- Inject JWT authentication headers for mutations (already implemented)
- Manage GraphQL cache invalidation for reviews
- Handle network errors and retry logic

### 1.3 Scope Definition

#### Phase 1: Minimum Viable Product (MVP)

**Must-Have Features:**

1. ✅ **Rating Submission (1-5 stars)** — Core review functionality
2. ✅ **Text Review (50-500 characters)** — Required field with validation
3. ✅ **Verified Purchase Badge** — Visual indicator on reviews from confirmed customers
4. ✅ **Moderation Queue** — All reviews pending approval by default
5. ✅ **Average Rating Display** — Shown on product cards and product detail page
6. ✅ **Review Count** — "(47 reviews)" displayed next to rating
7. ✅ **Spam Prevention** — Require authentication, 1 review per product per user
8. ✅ **SSR Reviews** — First 10 reviews included in initial HTML for SEO

**Success Criteria:**

- Authenticated users can submit reviews
- Reviews appear in WordPress admin moderation queue
- Approved reviews display on product pages
- Average rating updates automatically when reviews approved
- Product page HTML includes review structured data for Google
- No performance regression on product page load time (<50ms added latency)

#### Phase 2: Enhanced Features (Post-MVP)

**Optional Features (Prioritized):**

1. **Helpful/Upvote Counter** — Users can mark reviews as helpful
2. **Sort Options** — Most Recent, Highest Rated, Most Helpful
3. **Image Uploads** — Customers can attach product photos
4. **Seller Responses** — Admin can reply to reviews publicly
5. **Email Notifications** — Notify customers when review approved
6. **Review Reminders** — Auto-email 7 days post-delivery requesting review
7. **Review Filtering** — Filter by star rating (5★, 4★, etc.)
8. **Review Reporting** — Users can flag inappropriate reviews

**Deferred to Future Phases:**

- Multi-language review support (requires WPML/Polylang)
- Video reviews
- Review incentives (loyalty points for reviews)
- Sentiment analysis/AI moderation
- Review syndication to external platforms

### 1.4 Non-Functional Requirements

**Performance:**

- Product page SSR time: <2 seconds (includes review fetch)
- Review submission response time: <500ms
- Average rating calculation: Cached in product meta, updated on approval
- Review list pagination: 10 reviews per page, lazy load additional pages

**Security:**

- All review submissions require JWT authentication
- Content sanitization via `wp_kses_post()` to prevent XSS
- Rate limiting: 1 review per product per user (enforced in mutation resolver)
- SQL injection prevention via WordPress prepared statements (built-in)
- Spam detection via Antispam Bee (WordPress plugin, optional)

**Scalability:**

- Database indexes on `(comment_post_ID, comment_approved, comment_date DESC)`
- Transient caching for "recent reviews" widgets (5-minute TTL)
- Apollo Client cache for review lists (configurable TTL)
- Support for 10,000+ reviews per product without query performance degradation

**Accessibility:**

- ARIA labels for star ratings
- Keyboard navigation for review forms
- Screen reader announcements for review submission success/failure
- Semantic HTML for review lists (`<article>`, `<time>`, etc.)

**SEO:**

- Structured data (JSON-LD) for aggregate ratings and individual reviews
- Reviews included in initial SSR HTML (not lazy-loaded)
- Proper heading hierarchy (`<h2>` for "Customer Reviews")
- Canonical URLs for paginated review pages

### 1.5 Constraints and Assumptions

**Technical Constraints:**

1. **WordPress Hosting:** External hosting on home.pl (not in main repository)
2. **Database Access:** No direct SQL queries from Next.js (GraphQL only)
3. **Authentication:** Must use existing JWT token system (no new auth flow)
4. **Session Management:** Leverage existing WooCommerce session middleware
5. **No REST API:** GraphQL-only integration (no `wp-json` endpoints)

**Business Constraints:**

1. **Moderation Staffing:** Assume manual review approval (no AI auto-approval in MVP)
2. **Verified Purchase Only:** Optional enforcement (configurable in WooCommerce settings)
3. **Anonymous Reviews:** Not allowed (authentication required to reduce spam)

**Assumptions:**

1. WordPress plugins `WooCommerce`, `WPGraphQL`, `WPGraphQL for WooCommerce` are installed and active
2. WordPress database has sufficient storage for review content (estimate 1KB per review)
3. Home.pl MySQL server supports concurrent writes (review submissions won't block product page reads)
4. WordPress admin users have access to comment moderation dashboard
5. Product slugs are unique and stable (no URL changes after reviews published)

### 1.6 Integration Points

**Existing Systems:**

- ✅ Apollo Client with session middleware (`src/utils/apollo/ApolloClient.js`)
- ✅ JWT authentication system (`src/utils/auth.ts`)
- ✅ WooCommerce session management (localStorage `woo-session`)
- ✅ Product GraphQL queries (`src/utils/gql/PRODUCTS_AND_CATEGORIES_QUERY.js`)
- ✅ Product page SSR (`src/pages/product/[slug].tsx`)
- ✅ TypeScript product types (`src/types/product.ts`)

**New Dependencies:**

- WordPress plugin: `mebl-review-bridge` (custom, in this repository)
- GraphQL queries: `GET_PRODUCT_REVIEWS.js`, `SUBMIT_REVIEW.js` (new files)
- React components: `ProductReviews.component.tsx`, `ReviewForm.component.tsx`, `ReviewList.component.tsx` (new files)

### 1.7 Rollout Strategy

**Development Phase:**

1. Create WordPress plugin locally
2. Test GraphQL schema in GraphiQL IDE
3. Build Next.js components in isolation (Storybook optional)
4. Integration testing on staging environment

**Deployment Phase:**

1. Deploy WordPress plugin to home.pl production
2. Activate plugin and verify GraphQL schema
3. Deploy Next.js frontend with review components
4. Enable WooCommerce reviews in WordPress admin settings
5. Monitor error logs and performance metrics

**Rollback Plan:**

- Deactivate `mebl-review-bridge` plugin (reviews hidden, no data loss)
- Revert Next.js deployment (previous version without review components)
- Reviews data persists in WordPress database (safe to re-enable later)

---

**End of Part 1**

✅ Architecture decision confirmed  
✅ Scope boundaries defined  
✅ Constraints documented  
✅ Integration points identified

---
