=== MEBL 3D Configurator Bridge ===
Contributors: meblteam
Tags: woocommerce, 3d, configurator, graphql, nextjs
Requires at least: 6.0
Tested up to: 6.4
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connects WooCommerce products to 3D configurator models via a simple dropdown selector.

== Description ==

This plugin adds a simple meta box to WooCommerce products where you can:

* Enable/disable 3D configurator per product
* Select which 3D model to display from a dropdown
* Expose configurator settings via WPGraphQL for your Next.js frontend

Perfect for furniture stores with a Next.js 3D configurator frontend.

== Installation ==

1. Upload the plugin files to `/wp-content/plugins/mebl-configurator-bridge/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Edit any WooCommerce product
4. Find the "3D Configurator Settings" box in the sidebar
5. Enable configurator and select a model

== Frequently Asked Questions ==

= How do I add new models? =

Edit the file `includes/class-meta-fields.php` and add your model ID to the `$available_models` array.

= Does this work without WPGraphQL? =

Yes! The meta fields will save, but your frontend won't be able to fetch the data via GraphQL.

= Which WooCommerce product types are supported? =

All of them: Simple, Variable, External, and Grouped products.

== Changelog ==

= 1.0.0 =
* Initial release
* Meta box for product configurator settings
* WPGraphQL integration
* Product list column showing configurator status
