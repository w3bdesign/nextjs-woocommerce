## Part 6: Moderation, Security, and Abuse Prevention

### 6.1 Moderation Workflows

#### Approval Process

**Default Flow: Manual Moderation**

```
Review Submitted (comment_approved='0')
    ↓
WordPress Admin Notification
    ↓
Admin Reviews Comment in Dashboard
    ↓
Decision Point:
    ├── Approve → comment_approved='1' → Public display + cache update
    ├── Reject → comment_approved='trash' → Hidden from public
    └── Mark Spam → comment_approved='spam' → Spam database + training
```

**Auto-Approval Rules (Optional):**

```php
/**
 * Auto-approve reviews from trusted users
 * Add to plugin or functions.php
 */
add_filter('mebl_review_auto_approve', function($auto_approve, $user_id, $product_id) {
    // Auto-approve if user has 3+ approved reviews
    $approved_count = get_comments([
        'user_id' => $user_id,
        'status' => 'approve',
        'type' => 'review',
        'count' => true,
    ]);

    if ($approved_count >= 3) {
        return true;
    }

    // Auto-approve verified purchases (optional - higher trust)
    $verified = wc_customer_bought_product(
        get_userdata($user_id)->user_email,
        $user_id,
        $product_id
    );

    if ($verified) {
        return true; // Or keep manual for quality control
    }

    return $auto_approve;
}, 10, 3);

// Apply filter in mutation resolver
$auto_approve = apply_filters('mebl_review_auto_approve', false, $user_id, $product_id);
$comment_data['comment_approved'] = $auto_approve ? 1 : 0;
```

#### Moderation Queue Management

**Priority System:**

```php
/**
 * Sort moderation queue by priority
 */
add_filter('comments_clauses', function($clauses, $query) {
    global $wpdb;

    // Only apply to moderation queue
    if (!is_admin() || $query->query_vars['status'] !== 'hold') {
        return $clauses;
    }

    // Priority: Verified purchases first, then by date
    $clauses['join'] .= " LEFT JOIN {$wpdb->commentmeta} AS cm_verified
        ON {$wpdb->comments}.comment_ID = cm_verified.comment_id
        AND cm_verified.meta_key = 'verified'";

    $clauses['orderby'] = "cm_verified.meta_value DESC, {$wpdb->comments}.comment_date_gmt DESC";

    return $clauses;
}, 10, 2);
```

**Bulk Moderation Tools:**

```php
/**
 * Quick approve/reject actions in admin
 */
add_action('admin_footer-edit-comments.php', function() {
    ?>
    <script>
    jQuery(document).ready(function($) {
        // Add quick action buttons
        $('.comment-item').each(function() {
            var commentId = $(this).find('.check-column input').val();
            var actions = $(this).find('.row-actions');

            // Add "Quick Approve" button
            actions.append(' | <a href="#" class="quick-approve" data-id="' + commentId + '">Quick Approve</a>');
        });

        // Handle quick approve
        $('.quick-approve').on('click', function(e) {
            e.preventDefault();
            var commentId = $(this).data('id');

            $.post(ajaxurl, {
                action: 'mebl_quick_approve_review',
                comment_id: commentId,
                nonce: '<?php echo wp_create_nonce('mebl_quick_approve'); ?>'
            }, function(response) {
                if (response.success) {
                    location.reload();
                }
            });
        });
    });
    </script>
    <?php
});

// AJAX handler
add_action('wp_ajax_mebl_quick_approve_review', function() {
    check_ajax_referer('mebl_quick_approve', 'nonce');

    if (!current_user_can('moderate_comments')) {
        wp_send_json_error('Permission denied');
    }

    $comment_id = intval($_POST['comment_id']);
    wp_set_comment_status($comment_id, 'approve');

    wp_send_json_success();
});
```

#### Moderation Guidelines (Documentation)

**Create: `wordpress/mebl-review-bridge/MODERATION_GUIDELINES.md`**

```markdown
# Review Moderation Guidelines

## Approve Reviews That:

- ✅ Provide genuine product feedback (positive or negative)
- ✅ Are written in complete sentences
- ✅ Mention specific product features
- ✅ Come from verified purchases (prioritize)
- ✅ Are respectful and constructive

## Reject Reviews That:

- ❌ Contain profanity or hate speech
- ❌ Include personal information (phone numbers, addresses)
- ❌ Are promotional or contain URLs
- ❌ Are duplicate submissions
- ❌ Are off-topic or about shipping/customer service (not product)
- ❌ Violate copyright (copied from other sites)

## Mark as Spam:

- 🚫 Generic text ("Great product!", "Highly recommend!")
- 🚫 Bot-generated content
- 🚫 Gibberish or random characters
- 🚫 Repeated submissions from same user

## Editing Reviews:

- Minor typo fixes: ✅ Allowed
- Content changes: ❌ Not allowed (approve or reject as-is)
- Rating changes: ⚠️ Only if obviously incorrect (e.g., 1-star with glowing review)
```

### 6.2 Security Measures

#### Input Sanitization

**Backend (PHP):**

```php
/**
 * Enhanced sanitization in mutation resolver
 */
private static function submit_review_mutation($input, $context) {
    // ... authentication checks ...

    // Sanitize content (allow basic HTML, strip scripts)
    $allowed_tags = [
        'p' => [],
        'br' => [],
        'strong' => [],
        'em' => [],
        'ul' => [],
        'ol' => [],
        'li' => [],
    ];

    $content = wp_kses($input['content'], $allowed_tags);
    $content = sanitize_textarea_field($content); // Remove line breaks if needed

    // Strip any remaining HTML entities that could be XSS vectors
    $content = htmlspecialchars($content, ENT_QUOTES, 'UTF-8');

    // Validate rating is integer (prevent type juggling attacks)
    $rating = filter_var($input['rating'], FILTER_VALIDATE_INT);
    if ($rating === false || $rating < 1 || $rating > 5) {
        return [
            'success' => false,
            'message' => __('Invalid rating value.', 'mebl-review-bridge'),
            'review' => null,
        ];
    }

    // Validate product ID (prevent SQL injection)
    $product_id = absint($input['productId']);
    if ($product_id === 0) {
        return [
            'success' => false,
            'message' => __('Invalid product ID.', 'mebl-review-bridge'),
            'review' => null,
        ];
    }

    // ... rest of mutation logic ...
}
```

**Frontend (TypeScript):**

```typescript
/**
 * Client-side validation before submission
 */
const sanitizeReviewContent = (content: string): string => {
  // Remove HTML tags
  const stripped = content.replace(/<[^>]*>/g, '');

  // Remove URLs
  const noUrls = stripped.replace(/https?:\/\/[^\s]+/g, '[URL removed]');

  // Remove email addresses
  const noEmails = noUrls.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[Email removed]');

  // Remove phone numbers (simple pattern)
  const noPhones = noEmails.replace(
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g,
    '[Phone removed]',
  );

  // Trim whitespace
  return noPhones.trim();
};

// In ReviewForm component
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const sanitizedContent = sanitizeReviewContent(content);

  // Check for suspicious patterns
  if (
    sanitizedContent.includes('[URL removed]') ||
    sanitizedContent.includes('[Email removed]')
  ) {
    toast({
      title: 'Invalid Content',
      description:
        'Please remove URLs and contact information from your review.',
      variant: 'destructive',
    });
    return;
  }

  // ... submit mutation ...
};
```

#### SQL Injection Prevention

**WordPress Prepared Statements:**

```php
/**
 * All database queries use prepared statements
 */
global $wpdb;

// ✅ CORRECT: Prepared statement
$reviews = $wpdb->get_results($wpdb->prepare("
    SELECT c.*, cm.meta_value as rating
    FROM {$wpdb->comments} c
    INNER JOIN {$wpdb->commentmeta} cm ON c.comment_ID = cm.comment_id
    WHERE c.comment_post_ID = %d
      AND c.comment_approved = '1'
      AND cm.meta_key = 'rating'
    ORDER BY c.comment_date DESC
    LIMIT %d
", $product_id, $limit));

// ❌ WRONG: Direct interpolation (vulnerable)
$reviews = $wpdb->get_results("
    SELECT * FROM {$wpdb->comments}
    WHERE comment_post_ID = {$product_id}
");
```

#### CSRF Protection

**WordPress Nonces:**

```php
/**
 * CSRF protection for admin actions
 */
// In admin form
wp_nonce_field('mebl_review_rating_nonce', 'mebl_review_rating_nonce');

// In save handler
if (!isset($_POST['mebl_review_rating_nonce']) ||
    !wp_verify_nonce($_POST['mebl_review_rating_nonce'], 'mebl_review_rating_nonce')) {
    wp_die(__('Security check failed.', 'mebl-review-bridge'));
}
```

**GraphQL Mutations (JWT-based):**

```typescript
// Frontend: JWT token in headers (handled by Apollo middleware)
const authLink = setContext((_, { headers }) => {
  const token = sessionStorage.getItem('auth-token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Backend: Validate JWT in mutation resolver
if (!$context->user || !$context->user->ID) {
    throw new \GraphQL\Error\UserError('Authentication required');
}
```

#### XSS Prevention

**Output Escaping:**

```php
// In GraphQL resolver - escape before returning
return [
    'id' => (string) $comment->comment_ID,
    'author' => esc_html($comment->comment_author),
    'content' => wp_kses_post($comment->comment_content), // Allow safe HTML
    'rating' => (int) get_comment_meta($comment->comment_ID, 'rating', true),
];
```

```typescript
// In React component - dangerouslySetInnerHTML avoided
<TypographyP className="text-gray-700 whitespace-pre-line">
  {review.content} {/* React auto-escapes */}
</TypographyP>

// If HTML needed (e.g., line breaks):
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(review.content, {
  ALLOWED_TAGS: ['br', 'p', 'strong', 'em'],
});

<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

### 6.3 Spam Prevention Strategies

#### Rate Limiting

**Backend Implementation:**

```php
/**
 * Rate limiting in validation class
 */
class MEBL_Review_Validation {

    /**
     * Check rate limits (5 reviews per hour per user)
     */
    public static function check_rate_limit($user_id) {
        $transient_key = 'mebl_review_rate_limit_' . $user_id;
        $review_count = get_transient($transient_key);

        if ($review_count === false) {
            // First review in this hour
            set_transient($transient_key, 1, HOUR_IN_SECONDS);
            return true;
        }

        if ($review_count >= 5) {
            return false; // Rate limit exceeded
        }

        // Increment counter
        set_transient($transient_key, $review_count + 1, HOUR_IN_SECONDS);
        return true;
    }

    /**
     * Check for duplicate content (copy-paste spam)
     */
    public static function check_duplicate_content($content, $user_id) {
        global $wpdb;

        // Hash content for comparison
        $content_hash = md5(strtolower(trim($content)));

        // Check if user submitted identical review recently
        $duplicate = $wpdb->get_var($wpdb->prepare("
            SELECT c.comment_ID
            FROM {$wpdb->comments} c
            WHERE c.user_id = %d
              AND c.comment_type = 'review'
              AND MD5(LOWER(TRIM(c.comment_content))) = %s
              AND c.comment_date > DATE_SUB(NOW(), INTERVAL 30 DAY)
            LIMIT 1
        ", $user_id, $content_hash));

        return $duplicate === null;
    }
}
```

#### Akismet Integration (WordPress Plugin)

```php
/**
 * Spam check using Akismet (optional)
 */
add_filter('mebl_review_before_insert', function($comment_data) {
    // Check if Akismet is active
    if (!function_exists('akismet_check_db_comment')) {
        return $comment_data;
    }

    // Prepare data for Akismet
    $akismet_data = [
        'comment_type' => 'review',
        'comment_author' => $comment_data['comment_author'],
        'comment_author_email' => $comment_data['comment_author_email'],
        'comment_content' => $comment_data['comment_content'],
        'user_ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'],
        'referrer' => $_SERVER['HTTP_REFERER'] ?? '',
    ];

    // Check spam status
    $is_spam = akismet_check_db_comment($akismet_data);

    if ($is_spam === true) {
        // Mark as spam automatically
        $comment_data['comment_approved'] = 'spam';
    }

    return $comment_data;
});
```

#### Honeypot Fields (Frontend)

```typescript
/**
 * Add honeypot field to review form (hidden from users, visible to bots)
 */
export const ReviewForm: React.FC<ReviewFormProps> = ({ ... }) => {
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If honeypot filled, likely a bot
    if (honeypot !== '') {
      console.log('Spam detected via honeypot');
      return; // Silent fail (don't alert bot)
    }

    // ... continue with submission ...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Honeypot field (hidden with CSS, not display:none which bots detect) */}
      <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
        <Label htmlFor="website">Website</Label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Real form fields */}
      {/* ... */}
    </form>
  );
};
```

#### CAPTCHA Integration (Phase 2)

```typescript
/**
 * Google reCAPTCHA v3 integration (optional)
 */
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export const ReviewForm: React.FC<ReviewFormProps> = ({ ... }) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!executeRecaptcha) {
      console.log('reCAPTCHA not ready');
      return;
    }

    // Get reCAPTCHA token
    const token = await executeRecaptcha('submit_review');

    // Submit with token
    await submitReview({
      variables: {
        input: {
          productId,
          rating,
          content,
          recaptchaToken: token, // Add to input type
        },
      },
    });
  };

  // ... rest of component ...
};
```

**Backend Verification:**

```php
/**
 * Verify reCAPTCHA token (add to validation)
 */
private static function verify_recaptcha($token) {
    $secret = get_option('mebl_recaptcha_secret_key');

    if (empty($secret)) {
        return true; // Skip if not configured
    }

    $response = wp_remote_post('https://www.google.com/recaptcha/api/siteverify', [
        'body' => [
            'secret' => $secret,
            'response' => $token,
        ],
    ]);

    if (is_wp_error($response)) {
        return false;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);

    // reCAPTCHA v3 returns score (0.0 - 1.0)
    // Score > 0.5 is likely human
    return isset($body['success']) && $body['success'] && $body['score'] > 0.5;
}
```

### 6.4 Abuse Handling

#### User Reporting System (Phase 2)

**GraphQL Mutation:**

```graphql
mutation ReportReview($input: ReportReviewInput!) {
  reportReview(input: $input) {
    success
    message
  }
}

input ReportReviewInput {
  reviewId: ID!
  reason: ReportReason!
  details: String
}

enum ReportReason {
  SPAM
  OFFENSIVE
  OFF_TOPIC
  FAKE
  COPYRIGHT
  OTHER
}
```

**Backend Implementation:**

```php
/**
 * Report review mutation
 */
register_graphql_mutation('reportReview', [
    'inputFields' => [
        'reviewId' => ['type' => ['non_null' => 'ID']],
        'reason' => ['type' => ['non_null' => 'ReportReason']],
        'details' => ['type' => 'String'],
    ],
    'outputFields' => [
        'success' => ['type' => ['non_null' => 'Boolean']],
        'message' => ['type' => ['non_null' => 'String']],
    ],
    'mutateAndGetPayload' => function($input, $context) {
        if (!is_user_logged_in()) {
            return [
                'success' => false,
                'message' => __('You must be logged in to report reviews.', 'mebl-review-bridge'),
            ];
        }

        $review_id = intval($input['reviewId']);
        $user_id = get_current_user_id();

        // Check if already reported by this user
        $existing = get_comment_meta($review_id, '_mebl_reported_by', false);
        if (in_array($user_id, $existing)) {
            return [
                'success' => false,
                'message' => __('You have already reported this review.', 'mebl-review-bridge'),
            ];
        }

        // Store report
        add_comment_meta($review_id, '_mebl_reported_by', $user_id);
        add_comment_meta($review_id, '_mebl_report_reason', $input['reason']);
        add_comment_meta($review_id, '_mebl_report_details', $input['details'] ?? '');

        // Increment report count
        $report_count = (int) get_comment_meta($review_id, '_mebl_report_count', true);
        update_comment_meta($review_id, '_mebl_report_count', $report_count + 1);

        // Auto-hide if 3+ reports (configurable)
        $threshold = apply_filters('mebl_auto_hide_threshold', 3);
        if ($report_count + 1 >= $threshold) {
            wp_set_comment_status($review_id, 'hold'); // Move to moderation

            // Notify admin
            $admin_email = get_option('admin_email');
            wp_mail(
                $admin_email,
                __('Review flagged for moderation', 'mebl-review-bridge'),
                sprintf(__('Review #%d has been flagged by multiple users.', 'mebl-review-bridge'), $review_id)
            );
        }

        return [
            'success' => true,
            'message' => __('Thank you for reporting. We will review this content.', 'mebl-review-bridge'),
        ];
    },
]);
```

**Frontend Component:**

```typescript
/**
 * Report button in ReviewCard
 */
import { Flag } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const [reportReview] = useMutation(REPORT_REVIEW);
const [selectedReason, setSelectedReason] = useState('');

const handleReport = async () => {
  try {
    const { data } = await reportReview({
      variables: {
        input: {
          reviewId: review.id,
          reason: selectedReason,
        },
      },
    });

    if (data?.reportReview?.success) {
      toast.success('Review reported successfully');
    }
  } catch (error) {
    toast.error('Failed to report review');
  }
};

// In ReviewCard component
<div className="mt-3 flex items-center gap-4 text-sm">
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <button className="text-gray-500 hover:text-red-600 flex items-center gap-1">
        <Flag className="w-4 h-4" />
        Report
      </button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Report Review</AlertDialogTitle>
        <AlertDialogDescription>
          Please select a reason for reporting this review.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <Select value={selectedReason} onValueChange={setSelectedReason}>
        <SelectTrigger>
          <SelectValue placeholder="Select reason" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SPAM">Spam</SelectItem>
          <SelectItem value="OFFENSIVE">Offensive content</SelectItem>
          <SelectItem value="OFF_TOPIC">Off-topic</SelectItem>
          <SelectItem value="FAKE">Fake review</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectContent>
      </Select>

      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleReport}>
          Submit Report
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</div>
```

#### IP Blocking (Server-Level)

```php
/**
 * Block known spam IPs
 */
add_filter('mebl_review_before_insert', function($comment_data) {
    $ip = $_SERVER['REMOTE_ADDR'];

    // Check against blocklist
    $blocked_ips = get_option('mebl_blocked_ips', []);

    if (in_array($ip, $blocked_ips)) {
        wp_die(__('Your IP address has been blocked.', 'mebl-review-bridge'));
    }

    return $comment_data;
});

// Admin interface to manage blocklist
add_action('admin_menu', function() {
    add_submenu_page(
        'edit-comments.php',
        __('Blocked IPs', 'mebl-review-bridge'),
        __('Blocked IPs', 'mebl-review-bridge'),
        'moderate_comments',
        'mebl-blocked-ips',
        'mebl_render_blocked_ips_page'
    );
});
```

### 6.5 Content Moderation Policies

#### Automated Content Filtering

```php
/**
 * Blacklist filtering (profanity, spam keywords)
 */
class MEBL_Content_Filter {

    private static $blacklist = [
        'viagra', 'cialis', 'casino', 'forex', 'crypto',
        // Add profanity list
    ];

    public static function contains_blacklisted_words($content) {
        $content_lower = strtolower($content);

        foreach (self::$blacklist as $word) {
            if (strpos($content_lower, $word) !== false) {
                return true;
            }
        }

        return false;
    }

    public static function get_toxicity_score($content) {
        // Simple heuristics (Phase 2: integrate Perspective API)
        $score = 0;

        // All caps = +1
        if ($content === strtoupper($content)) {
            $score += 1;
        }

        // Excessive punctuation = +1
        if (substr_count($content, '!') > 3 || substr_count($content, '?') > 3) {
            $score += 1;
        }

        // Short generic reviews = +1
        if (strlen($content) < 20) {
            $score += 1;
        }

        return $score;
    }
}

// Apply in validation
if (MEBL_Content_Filter::contains_blacklisted_words($content)) {
    return [
        'success' => false,
        'message' => __('Your review contains prohibited content.', 'mebl-review-bridge'),
    ];
}

$toxicity = MEBL_Content_Filter::get_toxicity_score($content);
if ($toxicity > 2) {
    // Auto-flag for moderation
    $comment_data['comment_approved'] = 'hold';
}
```

#### Machine Learning Content Analysis (Phase 2)

```php
/**
 * Integrate Google Perspective API for toxicity detection
 */
function mebl_analyze_review_toxicity($content) {
    $api_key = get_option('mebl_perspective_api_key');

    if (empty($api_key)) {
        return 0; // Skip if not configured
    }

    $response = wp_remote_post('https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=' . $api_key, [
        'headers' => ['Content-Type' => 'application/json'],
        'body' => json_encode([
            'comment' => ['text' => $content],
            'requestedAttributes' => [
                'TOXICITY' => [],
                'SEVERE_TOXICITY' => [],
                'SPAM' => [],
            ],
        ]),
    ]);

    if (is_wp_error($response)) {
        return 0;
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    $toxicity = $body['attributeScores']['TOXICITY']['summaryScore']['value'] ?? 0;

    return $toxicity; // 0.0 - 1.0
}

// In mutation resolver
$toxicity_score = mebl_analyze_review_toxicity($content);
if ($toxicity_score > 0.7) {
    return [
        'success' => false,
        'message' => __('Your review violates our community guidelines.', 'mebl-review-bridge'),
    ];
}
```

### 6.6 Admin Monitoring Dashboard (Phase 2)

**Custom Admin Page:**

```php
/**
 * Review analytics dashboard
 */
add_action('admin_menu', function() {
    add_menu_page(
        __('Review Analytics', 'mebl-review-bridge'),
        __('Reviews', 'mebl-review-bridge'),
        'moderate_comments',
        'mebl-review-analytics',
        'mebl_render_analytics_page',
        'dashicons-star-filled',
        25
    );
});

function mebl_render_analytics_page() {
    global $wpdb;

    // Fetch statistics
    $total_reviews = $wpdb->get_var("
        SELECT COUNT(*) FROM {$wpdb->comments}
        WHERE comment_type = 'review'
    ");

    $pending_reviews = $wpdb->get_var("
        SELECT COUNT(*) FROM {$wpdb->comments}
        WHERE comment_type = 'review' AND comment_approved = '0'
    ");

    $spam_reviews = $wpdb->get_var("
        SELECT COUNT(*) FROM {$wpdb->comments}
        WHERE comment_type = 'review' AND comment_approved = 'spam'
    ");

    $avg_rating = $wpdb->get_var("
        SELECT AVG(CAST(cm.meta_value AS DECIMAL(3,2)))
        FROM {$wpdb->commentmeta} cm
        INNER JOIN {$wpdb->comments} c ON cm.comment_id = c.comment_ID
        WHERE c.comment_type = 'review'
          AND c.comment_approved = '1'
          AND cm.meta_key = 'rating'
    ");

    ?>
    <div class="wrap">
        <h1><?php _e('Review Analytics', 'mebl-review-bridge'); ?></h1>

        <div class="mebl-stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-top: 20px;">
            <div class="mebl-stat-card" style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                <h3><?php _e('Total Reviews', 'mebl-review-bridge'); ?></h3>
                <p style="font-size: 32px; font-weight: bold; margin: 10px 0;"><?php echo number_format($total_reviews); ?></p>
            </div>

            <div class="mebl-stat-card" style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                <h3><?php _e('Pending Moderation', 'mebl-review-bridge'); ?></h3>
                <p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #f59e0b;"><?php echo number_format($pending_reviews); ?></p>
            </div>

            <div class="mebl-stat-card" style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                <h3><?php _e('Marked as Spam', 'mebl-review-bridge'); ?></h3>
                <p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #ef4444;"><?php echo number_format($spam_reviews); ?></p>
            </div>

            <div class="mebl-stat-card" style="background: #fff; padding: 20px; border: 1px solid #ccc; border-radius: 8px;">
                <h3><?php _e('Average Rating', 'mebl-review-bridge'); ?></h3>
                <p style="font-size: 32px; font-weight: bold; margin: 10px 0; color: #10b981;"><?php echo number_format($avg_rating, 2); ?> / 5</p>
            </div>
        </div>

        <div style="margin-top: 40px;">
            <h2><?php _e('Recent Activity', 'mebl-review-bridge'); ?></h2>
            <?php
            // Show recent reviews table
            $recent = $wpdb->get_results("
                SELECT c.*, p.post_title, cm.meta_value as rating
                FROM {$wpdb->comments} c
                INNER JOIN {$wpdb->posts} p ON c.comment_post_ID = p.ID
                LEFT JOIN {$wpdb->commentmeta} cm ON c.comment_ID = cm.comment_id AND cm.meta_key = 'rating'
                WHERE c.comment_type = 'review'
                ORDER BY c.comment_date DESC
                LIMIT 10
            ");

            echo '<table class="wp-list-table widefat fixed striped">';
            echo '<thead><tr><th>Product</th><th>Author</th><th>Rating</th><th>Status</th><th>Date</th></tr></thead><tbody>';
            foreach ($recent as $review) {
                $status_labels = [
                    '0' => 'Pending',
                    '1' => 'Approved',
                    'spam' => 'Spam',
                ];
                echo '<tr>';
                echo '<td>' . esc_html($review->post_title) . '</td>';
                echo '<td>' . esc_html($review->comment_author) . '</td>';
                echo '<td>' . str_repeat('★', (int)$review->rating) . '</td>';
                echo '<td>' . $status_labels[$review->comment_approved] . '</td>';
                echo '<td>' . date('Y-m-d H:i', strtotime($review->comment_date)) . '</td>';
                echo '</tr>';
            }
            echo '</tbody></table>';
            ?>
        </div>
    </div>
    <?php
}
```

---

**End of Part 6**

✅ Moderation workflows defined (manual, auto-approval, priority queuing)  
✅ Security measures implemented (input sanitization, SQL injection prevention, XSS protection)  
✅ Spam prevention strategies detailed (rate limiting, Akismet, honeypots, CAPTCHA)  
✅ Abuse handling system designed (user reporting, IP blocking, content filtering)  
✅ Content moderation policies established (blacklist filtering, toxicity scoring)  
✅ Admin monitoring dashboard specified

---
