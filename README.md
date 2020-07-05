![Screenshot 1](./screenshots/screenshot1.jpg)

# Next.js Ecommerce site with Woocommerce backend

## Live URL: https://nextjs-woocommerce.now.sh/

1. Install and activate the following plugins, in your WordPress plugin directory:

- [woocommerce](https://wordpress.org/plugins/woocommerce) Ecommerce for Wordpress.
- [wp-graphql](https://github.com/wp-graphql/wp-graphql) Exposes graphql for WordPress.
- [wp-graphiql](https://github.com/wp-graphql/wp-graphiql) Provides GraphiQL IDE (playground) to the WP-Admin.
- [wp-graphql-woocommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) Adds Woocommerce functionality to a WPGraphQL schema.
- [algolia-woo-indexer](https://github.com/w3bdesign/algolia-woo-indexer) Sends WooCommerce products to Algolia.

1. Make sure WooCommerce has some products already or import some sample products

   The WooCommerce sample products CSV file is available at `wp-content/plugins/woocommerce/sample-data/sample_products.csv` or [Sample products](sample_products/sample_products.csv) 

   Import the products at `WP Dashboard > Tools > Import > WooCommerce products(CSV)`

2. Clone or fork the repo and modify `nextConfig.js`
3. Modify the values according to your setup
4. Start the server with `npm run dev`
5. Enable COD (Cash On Demand) payment method in WooCommerce

## Features

- Connect to Woocommerce GraphQL API and list name, price and display image for products
- Cart handling with createContext and GraphQL mutations
- Able to place orders with WooCommerce (Cash On Delivery only for now)
- Algolia search
- Apollo Client with GraphQL
- Animations with React-Spring and Animate.css
- Loading spinner created with Styled Components
- Shows page load progress with Nprogress during navigation
- Mobile menu and cart slide-out with animations
- List all product categories on a separate page
- Link to individual product
- Pretty URLs with builtin Nextjs functionality
- Tailwind CSS for styling
- Minimalistic and responsive design
- JSDoc comments

## TODO

- Make search results from Algolia clickable
- Add support for variable products / product variations
- Hide products not in stock
- Add better SEO
- Add a better README.md
- Implement https://github.com/cyrilwanner/next-optimized-images for production
