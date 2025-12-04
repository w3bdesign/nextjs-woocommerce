# Mebl Configurator Order Meta

Small plugin to persist 3D configurator `extraData` from cart items into WooCommerce order item meta and display it in the admin order page.

Installation

1. Copy the `mebl-configurator-order-meta` folder to `wp-content/plugins/` on your WordPress installation.
2. Activate the plugin in WordPress admin under Plugins.

Behavior

- On checkout the plugin listens to `woocommerce_checkout_create_order_line_item` and saves the cart `extraData` into order item meta under the key `_mebl_configurator`.
- On the WooCommerce order edit screen the plugin prints a compact summary (colors and dimensions) under each order line item.

Notes

- Uses WooCommerce CRUD methods so it should be compatible with custom order tables.
- By default the plugin stores the entire configurator payload as a single JSON meta entry (recommended). If you want queryable atomic meta fields, we can extend the save routine to add them.
