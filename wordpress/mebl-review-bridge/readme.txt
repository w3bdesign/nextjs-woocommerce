=== MEBL Review Bridge ===
Contributors: meblteam
Tags: woocommerce, reviews, graphql, headless, product-reviews
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Headless API bridge for WooCommerce product reviews. Stores reviews in WordPress comments, calculates aggregates, and prepares for GraphQL exposure.

== Description ==

**MEBL Review Bridge** is a WordPress plugin designed for headless WooCommerce architectures. It provides a robust backend for managing product reviews while exposing data via GraphQL for consumption by modern frontends like Next.js.

= Key Features =

* **Native WordPress Storage**: Reviews stored in `wp_comments` table with `comment_type='review'`
* **Verified Purchase Badges**: Automatic verification using WooCommerce order data
* **Rating Aggregates**: Calculates and caches average ratings, review counts, and rating histograms
* **Performance Optimized**: Custom database indexes for fast queries
* **GraphQL Ready**: Designed to work with WPGraphQL (Phase 3)
* **Moderation Support**: Uses WordPress native comment moderation system
* **No Anonymous Reviews**: Requires authentication to reduce spam

= Architecture =

This plugin is part of a multi-phase implementation:

* **Phase 1 (Complete)**: Data model, storage, and aggregation
* **Phase 2 (Complete)**: Moderation and state management
* **Phase 3**: GraphQL schema and queries
* **Phase 4**: Review submission mutations
* **Phase 5**: Next.js frontend integration

= Moderation & Review Lifecycle (Phase 2) =

**Moderation States:**

* **Pending** (`comment_approved='0'`): Default state after submission, awaiting admin approval
* **Approved** (`comment_approved='1'`): Visible to public via GraphQL and frontend
* **Spam** (`comment_approved='spam'`): Marked as spam, hidden from all queries
* **Trash** (`comment_approved='trash'`): Soft-deleted, excluded from aggregates

**Visibility Rules:**

* Only approved reviews (`'1'`) are visible to unauthenticated users via GraphQL
* Users can see their own pending reviews when authenticated
* Spam and trashed reviews are never exposed via GraphQL
* Only approved reviews included in rating calculations

**Duplicate Prevention:**

* One review per product per user (for approved/pending reviews only)
* Users can resubmit if previous review was trashed or marked as spam
* Admin users (with `manage_woocommerce` capability) bypass duplicate checks

**Rate Limiting:**

* Maximum 5 reviews per hour per user
* Uses WordPress transients with automatic 1-hour expiration
* Admin users (with `manage_woocommerce` capability) bypass rate limits
* Prevents review spam without affecting legitimate users

**Admin Workflow:**

1. Navigate to **Comments** in WordPress admin dashboard
2. Filter by "Product Reviews" to show only `comment_type='review'`
3. Approve, spam, or trash reviews using standard WordPress moderation tools
4. Rating aggregates automatically update on status changes

= System Requirements =

* WordPress 6.0 or higher
* PHP 8.0 or higher
* WooCommerce 7.0 or higher (required)
* WPGraphQL 1.x or higher (recommended for GraphQL features)
* WPGraphQL for WooCommerce (recommended)

= Database Schema =

Reviews are stored using WordPress core tables:

* `wp_comments` - Review content, author, timestamps
* `wp_commentmeta` - Rating (1-5), verified purchase flag
* `wp_postmeta` - Cached aggregates (_wc_average_rating, _wc_review_count, _wc_rating_histogram)

Custom indexes are created on activation for optimal query performance.

== Installation ==

= Automatic Installation =

1. Log in to your WordPress admin dashboard
2. Navigate to **Plugins > Add New**
3. Search for "MEBL Review Bridge"
4. Click **Install Now** and then **Activate**

= Manual Installation =

1. Download the plugin ZIP file
2. Upload to `/wp-content/plugins/mebl-review-bridge/`
3. Activate the plugin through the **Plugins** menu in WordPress
4. Ensure WooCommerce is installed and activated

= Post-Installation =

1. Go to **WooCommerce > Settings > Products**
2. Enable product reviews
3. Configure comment moderation settings in **Settings > Discussion**
4. Install WPGraphQL for GraphQL features (optional, Phase 3)

== Frequently Asked Questions ==

= Do I need WPGraphQL? =

WPGraphQL is optional for Phase 1 but will be required in Phase 3 when GraphQL schema is added. The plugin will show a notice if WPGraphQL is not installed.

= Where are reviews stored? =

Reviews are stored in the WordPress `wp_comments` table with `comment_type='review'`. This uses native WordPress infrastructure for maximum compatibility.

= How are ratings calculated? =

Average ratings are calculated from all approved reviews and cached in product meta (`_wc_average_rating`). Ratings are automatically recalculated when reviews are approved, edited, or deleted.

= Can customers leave anonymous reviews? =

No. All reviews require an authenticated user (user_id > 0). This reduces spam and enables verified purchase checks.

= How do verified purchases work? =

The plugin uses WooCommerce's `wc_customer_bought_product()` function to check if a user has completed an order containing the product. Verified status is stored in comment metadata.

= What happens to existing reviews? =

Existing WooCommerce reviews in the `wp_comments` table are compatible. The plugin will automatically recognize them and calculate ratings.

= Does this affect site performance? =

No. The plugin creates optimized database indexes on activation and caches rating aggregates in product meta. Review queries are fast even with thousands of reviews per product.

== Screenshots ==

1. WordPress comment moderation dashboard showing product reviews
2. Review metadata (rating, verified purchase) in comment edit screen
3. Product page with cached rating aggregates (Phase 5 frontend)

== Changelog ==

= 1.0.0 =
* Initial release
* Phase 1: Data model and storage implementation
* Phase 2: Moderation and state management
* Review CRUD operations via MEBL_Review_Storage class
* Rating aggregation via MEBL_Rating_Aggregator class
* Review validation via MEBL_Review_Validation class
* Duplicate review prevention (one per product per user)
* Rate limiting (max 5 reviews per hour per user)
* Admin bypass for duplicate and rate limit checks
* WordPress hooks for automatic cache invalidation
* Database indexes for query optimization
* Verified purchase calculation
* WooCommerce dependency checks

== Upgrade Notice ==

= 1.0.0 =
Initial release. Phase 1 of multi-phase review system implementation.

== Technical Details ==

= For Developers =

**Classes:**

* `MEBL_Review_Storage` - Review CRUD operations, duplicate checking, rate limiting
* `MEBL_Rating_Aggregator` - Rating calculations and caching
* `MEBL_Review_Hooks` - WordPress action/filter hooks
* `MEBL_Review_Validation` - Review submission validation (Phase 2)

**Hooks:**

* `comment_post` - Enforce review type, add metadata
* `transition_comment_status` - Recalculate ratings on approval/rejection
* `deleted_comment` - Recalculate ratings on deletion
* `edit_comment` - Recalculate ratings on edit

**Database Indexes:**

* `idx_product_reviews` - Optimizes product review queries
* `idx_user_reviews` - Optimizes user review history
* `idx_moderation_queue` - Optimizes admin moderation dashboard

**Meta Keys:**

* `rating` (commentmeta) - Integer 1-5
* `verified` (commentmeta) - '0' or '1'
* `moderation_state` (commentmeta) - Cached moderation state
* `_wc_average_rating` (postmeta) - Float, cached average
* `_wc_review_count` (postmeta) - Integer, cached count
* `_wc_rating_histogram` (postmeta) - JSON, rating distribution

**Transients (Rate Limiting):**

* `mebl_rate_limit_user_{$user_id}` - Review submission counter (1-hour TTL)

== Privacy Policy ==

This plugin stores the following user data:

* Review author name (public)
* Review author email (hidden, used for verification only)
* Review author IP address (spam prevention)
* User ID (for verified purchase checks)

When a user account is deleted, WordPress core automatically anonymizes their reviews. No additional personal data is stored by this plugin.

== Support ==

For support, bug reports, or feature requests, please visit:
https://github.com/szpeqq/mebl

== Credits ==

Developed by the MEBL Team for headless WooCommerce architectures.
