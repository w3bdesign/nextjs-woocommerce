![Screenshot 1](./screenshots/screenshot1.jpg)

# Next.js Ecommerce site with Woocommerce backend

## This is still a work in progress, but you can place orders and add products to cart.

Live url: <a href="https://nextjs-woocommerce.now.sh/">https://nextjs-woocommerce.now.sh/</a>

1. Install and activate the following plugins, in your WordPress plugin directory:

* [wp-graphql](https://github.com/wp-graphql/wp-graphql) Exposes graphql for WordPress .
* [wp-graphiql](https://github.com/wp-graphql/wp-graphiql) Provides GraphiQL IDE (playground) to the WP-Admin.
* [wp-graphql-woocommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) Adds Woocommerce functionality to a WPGraphQL schema.
* [algolia-woo-indexer](https://github.com/w3bdesign/algolia-woo-indexer) Sends WooCommerce products to Algolia.

You can also import default Woocommerce products that come with wooCommerce Plugin for development ( if you don't have any products in your WordPress install ) `WP Dashboard > Tools > Import > WooCommerce products(CSV)`: The WooCommerce default products csv file is available at `wp-content/plugins/woocommerce/sample-data/sample_products.csv`

2. Clone or fork the repo and modify ```nextConfig.js```
3. Modify the values according to your setup

Start the server with ```npm run dev ```

## Features

- Connect to Woocommerce GraphQL API and list name, price and display image for products
- Cart handling with createContext and GraphQL mutations
- Able to place orders remotely with Woocommerce (bank transfers only for now)
- Algolia search (work in progress)
- Apollo Client with GraphQL
- Animations with React-Spring
- Shows loading spinner created with Styled Components while loading data and error message if data can not be loaded
- Mobile menu
- List all product categories on a separate page
- Link to individual product
- Pretty URLs with builtin Nextjs functionality
- Tailwind CSS for styling
- Minimalistic and responsive design
- JSDoc comments
- Currently connected to a local installation

## TODO

- Validate remote Woocommerce session (or delete old session?)
- Hide products not in stock
- Add better SEO
- Add price to Algolia search (Wordpress plugin has been developed, needs to be integrated)
- Add a better README.md
- Implement https://github.com/cyrilwanner/next-optimized-images for production
