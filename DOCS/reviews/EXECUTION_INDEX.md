# Review System – Execution Index

**Purpose**
This file is the _only_ global context Copilot should rely on.
All implementation details, rationale, and constraints live in the canonical spec.

Canonical spec location:

```
docs/reviews/REVIEW_SYSTEM_CANONICAL_SPEC.md
```

Rules for execution:

- Implement exactly what the referenced spec sections describe
- Do not redesign architecture
- Do not introduce new features
- If something is unclear, ask before proceeding
- Treat completed phases as immutable

---

## Phase 0 – Platform Prerequisites (WordPress Admin Only)

**Goal:** Ensure WordPress and WooCommerce are correctly configured to support reviews.

Tasks:

1. Enable WooCommerce product reviews
2. Enable comment moderation and threading
3. Configure anti-spam baseline (Antispam Bee or equivalent)
4. Verify required plugins are installed and active:
   - WooCommerce
   - WPGraphQL
   - WPGraphQL for WooCommerce

Spec reference:

- Architecture & Scope
- SEO & Platform Assumptions

Out of scope:

- Custom PHP
- GraphQL
- Frontend

Output:

- WordPress Admin configuration checklist

---

## Phase 1 – Review Data Model & Storage (WordPress Core)

**Goal:** Define how reviews are stored, classified, and aggregated.

Tasks:

1. Use WordPress comments as the canonical review entity
2. Enforce `comment_type = 'review'`
3. Define and store review metadata:
   - rating
   - verified_purchase
   - moderation_state

4. Implement product-level aggregate rating calculation
5. Define caching strategy for aggregates

Spec reference:

- Data Model
- Review Storage
- Rating Aggregation
- Caching Rules

Out of scope:

- GraphQL exposure
- Frontend rendering
- Admin UI customization

Output:

- PHP implementation
- Database/meta usage confirmation

---

## Phase 2 – Moderation & State Management

**Goal:** Enforce review lifecycle and visibility rules.

Tasks:

1. Define moderation states:
   - pending
   - approved
   - rejected / spam

2. Visibility rules for frontend and API
3. Rules for verified vs unverified reviews
4. Rating inclusion/exclusion logic based on state

Spec reference:

- Moderation Rules
- Visibility Constraints
- Anti-Abuse Logic

Out of scope:

- Admin UI polish
- Frontend UX
- GraphQL mutations

Output:

- Backend enforcement logic

---

## Phase 3 – GraphQL Read API

**Goal:** Leverage WooGraphQL's native review fields for MVP.

**Integration Model:** WooGraphQL already provides `reviews`, `reviewsAllowed`, `averageRating`, `reviewCount` on all Product types. Our plugin provides the backend that populates the cache meta (`_wc_average_rating`, `_wc_review_count`) that WooGraphQL's native resolvers read from.

**For MVP:** No custom GraphQL fields needed. WooGraphQL's native schema is sufficient.

Tasks:

1. Verify Phase 1/2 backend populates `_wc_average_rating` and `_wc_review_count` correctly
2. Test WooGraphQL's native review fields in GraphiQL
3. Document integration points with WooGraphQL

Spec reference:

- GraphQL Schema (part-3.md)
- WooGraphQL Integration (WOOGQL_INTEGRATION.md)
- Product Extensions

**WooGraphQL Native Fields (Use directly):**

- `reviews` (ProductToCommentConnection) - paginated review list
- `reviewsAllowed` (Boolean) - whether comments are open
- `averageRating` (Float) - reads from `_wc_average_rating` meta
- `reviewCount` (Int) - reads from `_wc_review_count` meta

**Custom Plugin Value:**

- Backend data pipeline (Phase 1/2) that populates `_wc_*` meta cache

Out of scope:

- Mutations (Phase 4)
- Frontend UI (Phase 5)
- Custom GraphQL extensions beyond WooGraphQL

Output:

- Integration documentation
- Test verification that WooGraphQL fields work correctly

---

## Phase 4 – Review Submission (GraphQL Write API)

**Goal:** Allow authenticated users to submit reviews.

Tasks:

1. Implement `submitReview` mutation
2. Validate input (rating range, content length)
3. Enforce purchase verification rules
4. Apply moderation defaults
5. Apply rate limiting and abuse prevention

Spec reference:

- Mutations
- Validation Rules
- Abuse Prevention

Out of scope:

- Frontend forms
- Admin moderation UI

Output:

- GraphQL mutation implementation

---

## Phase 5 – Frontend Integration (Next.js)

**Goal:** Display and submit reviews on the product page.

Tasks:

1. Fetch reviews and aggregates via GraphQL
2. Implement SSR-safe queries
3. Render review list with pagination
4. Implement review submission flow
5. Display verified purchase and moderation states

Spec reference:

- Frontend Integration
- UX Rules
- Error States

Out of scope:

- Visual polish
- Design system decisions
- SEO markup

Output:

- Frontend integration code

---

## Phase 6 – Admin & Moderation UX (WordPress)

**Goal:** Improve review management experience for admins and implement email notifications.

Tasks:

1. Customize review list table
2. Display rating and verification status
3. Add moderation shortcuts
4. Support bulk actions
5. Implement email notifications (admin alerts on submission, reviewer approval notifications)

Spec reference:

- Admin UI
- Moderation Workflow
- Email Notifications (Part 6, Section 6.2)

Out of scope:

- Frontend
- GraphQL
- SEO

Output:

- WordPress admin UI enhancements

---

## Phase 7 – SEO & Structured Data

**Goal:** Ensure reviews contribute to SEO correctly.

Tasks:

1. Generate aggregate rating JSON-LD
2. Generate individual review schema
3. Ensure schema visibility rules align with moderation
4. Validate against Google Rich Results requirements

Spec reference:

- SEO
- Structured Data

Out of scope:

- UI
- GraphQL changes

Output:

- SEO markup implementation

---

## Phase 8 – Performance, Rollout & Safety

**Goal:** Ensure stability and safe deployment.

Tasks:

1. Cache invalidation rules
2. Performance safeguards
3. Feature-flagged rollout
4. Rollback strategy

Spec reference:

- Performance
- Rollout & Rollback

Out of scope:

- New features
- Refactors

Output:

- Production-readiness checklist

---

## Execution Rule Summary (For Copilot)

- Work on **one phase only**
- Only use referenced spec sections
- Never assume defaults not stated in the spec
- Stop after completing the requested task
- Ask before crossing phase boundaries

---
