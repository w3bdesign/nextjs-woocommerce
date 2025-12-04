<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Mebl_Configurator_Order_Meta
 *
 * Handles copying configurator extraData from cart items to order item meta
 * and rendering a readable summary in WooCommerce admin order page.
 */
class Mebl_Configurator_Order_Meta {
    /**
     * Singleton instance
     *
     * @var Mebl_Configurator_Order_Meta
     */
    protected static $instance = null;

    /**
     * Meta key used to store configurator payload
     */
    const META_KEY = '_mebl_configurator';

    /**
     * Get singleton instance
     *
     * @return Mebl_Configurator_Order_Meta
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Persist configurator payload into order item meta during checkout
        add_action('woocommerce_checkout_create_order_line_item', array($this, 'copy_cart_meta_to_order_item'), 10, 4);

        // Display the configurator meta under order items in admin
        add_action('woocommerce_after_order_itemmeta', array($this, 'render_order_item_configurator_meta'), 10, 3);
        // Hide raw configurator meta keys from the editable meta table in admin
        add_filter('woocommerce_hidden_order_itemmeta', array($this, 'hide_configurator_meta'), 10, 1);
        // Debug: plugin initialized (suppressed unless WP_DEBUG=true)
        // $this->write_log('[MEBL] Mebl_Configurator_Order_Meta initialized');
    }

    /**
     * Add configurator meta keys to the list of hidden order item meta (admin)
     *
     * @param array $hidden_meta
     * @return array
     */
    public function hide_configurator_meta($hidden_meta) {
        if (!is_array($hidden_meta)) {
            $hidden_meta = (array) $hidden_meta;
        }

        $keys = array(
            self::META_KEY,
            '_mebl_configurator_modelId',
            '_mebl_configurator_dimensions',
            '_mebl_configurator_items'
        );

        foreach ($keys as $k) {
            if (!in_array($k, $hidden_meta, true)) {
                $hidden_meta[] = $k;
            }
        }

        return $hidden_meta;
    }

    /**
     * Write a log message. By default only errors are written unless WP_DEBUG is enabled.
     *
     * @param string $message
     * @param string $level  'error'|'info' (only 'error' is persisted unless WP_DEBUG is true)
     * @return void
     */
    private function write_log($message, $level = 'info') {
        // Only persist error-level messages by default. Allow verbose logging when WP_DEBUG is enabled.
        if ($level !== 'error' && !(defined('WP_DEBUG') && WP_DEBUG === true)) {
            return;
        }

        // Write to PHP error log if available
        if (function_exists('error_log')) {
            error_log($message);
        }

        // Also append to a file in uploads for easy access
        if (function_exists('wp_upload_dir')) {
            $upload = wp_upload_dir();
            $basedir = isset($upload['basedir']) ? untrailingslashit($upload['basedir']) : false;
        } else {
            // Fallback to WP_CONTENT_DIR/uploads if available
            $basedir = defined('WP_CONTENT_DIR') ? WP_CONTENT_DIR . '/uploads' : false;
        }

        if ($basedir) {
            // Ensure directory exists
            if (!is_dir($basedir) && function_exists('wp_mkdir_p')) {
                wp_mkdir_p($basedir);
            }

            $log_file = $basedir . '/mebl-configurator.log';
            // Prepend ISO timestamp
            @file_put_contents($log_file, date('c') . ' ' . strtoupper($level) . ' ' . $message . PHP_EOL, FILE_APPEND | LOCK_EX);
        }
    }

    /**
     * Copy cart extraData into order item meta
     *
     * @param WC_Order_Item_Product $order_item
     * @param string $cart_item_key
     * @param array $values
     * @param WC_Order $order
     */
    public function copy_cart_meta_to_order_item($order_item, $cart_item_key, $values, $order) {
        // Debug: hook called (suppressed unless WP_DEBUG=true)
        $order_id = (is_object($order) && method_exists($order, 'get_id')) ? $order->get_id() : 'unknown';
        // $this->write_log('[MEBL] copy_cart_meta_to_order_item called for cart_key=' . $cart_item_key . ' order=' . $order_id . ' values=' . print_r($values, true));

        // Look for extraData in different possible locations for robustness
        $extra_data = null;

        if (!empty($values['extraData'])) {
            $extra_data = $values['extraData'];
        } elseif (!empty($values['meta_data']) && is_array($values['meta_data'])) {
            // some flows might pass meta_data as array of objects [ ['key'=>..., 'value'=>...] ]
            $container = array();
            foreach ($values['meta_data'] as $md) {
                if (isset($md['key']) && isset($md['value'])) {
                    $container[$md['key']] = $md['value'];
                }
            }
            $extra_data = $container;
        }

        // If we didn't find extraData in usual places, detect when the $values
        // itself contains the configurator keys (items/dimensions/modelId, etc.)
        if (empty($extra_data) && is_array($values) && (isset($values['items']) || isset($values['dimensions']) || isset($values['modelId']))) {
            $allowed_keys = array('items', 'dimensions', 'interactiveStates', 'modelId', 'timestamp', 'version');
            $container = array();
            foreach ($allowed_keys as $k) {
                if (isset($values[$k])) {
                    $container[$k] = $values[$k];
                }
            }
            if (!empty($container)) {
                $extra_data = $container;
                // informational - suppressed by default
                // $this->write_log('[MEBL] Detected top-level configurator payload for cart_key=' . $cart_item_key . ' extracted_keys=' . implode(',', array_keys($container)));
            }
        }

        if (empty($extra_data)) {
            // No configurator payload found for this cart item. Not an error.
            return;
        }

        // Normalize payload: if it's an array of key/value objects convert to assoc
        $payload = array();

        if (is_array($extra_data)) {
            // If associative already and contains our keys, use as-is
            $has_string_keys = array_keys($extra_data) !== range(0, count($extra_data) - 1);
            if ($has_string_keys) {
                $payload = $extra_data;
            } else {
                // likely an array of objects like [ {key: 'items', value: '...'}, ... ]
                foreach ($extra_data as $entry) {
                    if (is_array($entry) && isset($entry['key'])) {
                        $payload[$entry['key']] = isset($entry['value']) ? $entry['value'] : null;
                    }
                }
            }
        } else {
            // If it's a string, try decode JSON
            if (is_string($extra_data)) {
                $decoded = json_decode($extra_data, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $payload = $decoded;
                } else {
                    // store raw string under 'raw'
                    $payload = array('raw' => $extra_data);
                }
            }
        }

        if (empty($payload)) {
            // Unexpected: no payload to persist
            $this->write_log('[MEBL] Payload empty after normalization for cart_key=' . $cart_item_key . ' payload=' . print_r($payload, true), 'error');
            return;
        }

        // Save single JSON meta atomically
        $json = wp_json_encode($payload);
        if ($json === false) {
            // Serious error: failed to encode payload
            $this->write_log('[MEBL] wp_json_encode failed for cart_key=' . $cart_item_key . ' error=' . json_last_error_msg(), 'error');
            return; // encoding failed
        }

        // Use WooCommerce CRUD API to add canonical JSON meta (supports custom order tables)
        $order_item->add_meta_data(self::META_KEY, $json, true);
        // informational: suppressed by default
        // $this->write_log('[MEBL] Added meta ' . self::META_KEY . ' for cart_key=' . $cart_item_key . ' value=' . $json);

        // --- Hybrid persistence: also store atomic meta keys for easy querying ---
        // modelId as plain text (if present)
        if (!empty($payload['modelId'])) {
            $model_id = sanitize_text_field((string) $payload['modelId']);
            $order_item->add_meta_data('_mebl_configurator_modelId', $model_id, true);
            // informational: suppressed by default
            // $this->write_log('[MEBL] Added meta _mebl_configurator_modelId=' . $model_id . ' for cart_key=' . $cart_item_key);
        }

        // dimensions as JSON (if present)
        if (!empty($payload['dimensions']) && is_array($payload['dimensions'])) {
            $dim_json = wp_json_encode($payload['dimensions']);
            if ($dim_json !== false) {
                $order_item->add_meta_data('_mebl_configurator_dimensions', $dim_json, true);
                // informational: suppressed by default
                // $this->write_log('[MEBL] Added meta _mebl_configurator_dimensions for cart_key=' . $cart_item_key . ' value=' . $dim_json);
            }
        }

        // items (colors / parts) as JSON (if present)
        if (!empty($payload['items']) && is_array($payload['items'])) {
            $items_json = wp_json_encode($payload['items']);
            if ($items_json !== false) {
                $order_item->add_meta_data('_mebl_configurator_items', $items_json, true);
                // informational: suppressed by default
                // $this->write_log('[MEBL] Added meta _mebl_configurator_items for cart_key=' . $cart_item_key . ' value=' . $items_json);
            }
        }
    }

    /**
     * Render configurator meta under an order line item in admin
     *
     * @param int $item_id
     * @param WC_Order_Item_Product $item
     * @param WC_Product $product
     */
    public function render_order_item_configurator_meta($item_id, $item, $product) {
        if (!current_user_can('edit_shop_orders')) {
            return;
        }

        // Retrieve meta
        $meta = $item->get_meta(self::META_KEY, true);
        $this->write_log('[MEBL] render_order_item_configurator_meta called for item_id=' . $item_id . ' meta_present=' . (empty($meta) ? 'no' : 'yes'));
        if (!empty($meta)) {
            $this->write_log('[MEBL] Raw meta for item_id=' . $item_id . ': ' . $meta);
        }
        if (empty($meta)) {
            return;
        }

        $data = json_decode($meta, true);
        if (json_last_error() !== JSON_ERROR_NONE || empty($data) || !is_array($data)) {
            // Show raw value fallback
            $this->write_log('[MEBL] Failed to decode JSON meta for item_id=' . $item_id . ' json_error=' . json_last_error_msg());
            echo '<div class="mebl-configurator-meta"><strong>Configurator:</strong> <pre style="white-space:pre-wrap;">' . esc_html($meta) . '</pre></div>';
            return;
        }

        $this->write_log('[MEBL] Decoded meta for item_id=' . $item_id . ': ' . print_r($data, true));
        // Prepare a compact summary showing colors/items and dimensions if present
        echo '<div class="mebl-configurator-meta" style="margin-top:6px;">';
        echo '<strong style="display:block;margin-bottom:4px;">🎨 Configurator</strong>';

        // Colors / items
        if (!empty($data['items']) && is_array($data['items'])) {
            echo '<div style="margin-bottom:4px;"><em>Colors:</em> ';
            $parts = array();
            foreach ($data['items'] as $k => $v) {
                $parts[] = esc_html($k) . ': ' . esc_html(is_array($v) ? json_encode($v) : $v);
            }
            echo esc_html(implode(', ', $parts));
            echo '</div>';
        }

        // Dimensions
        if (!empty($data['dimensions']) && is_array($data['dimensions'])) {
            echo '<div style="margin-bottom:4px;"><em>Dimensions:</em> ';
            $parts = array();
            foreach ($data['dimensions'] as $k => $v) {
                $parts[] = esc_html($k) . ': ' . esc_html((string) $v);
            }
            echo esc_html(implode(', ', $parts));
            echo '</div>';
        }

        // ModelId
        if (!empty($data['modelId'])) {
            echo '<div><em>Model:</em> ' . esc_html((string) $data['modelId']) . '</div>';
        }

        echo '</div>';
    }
}
