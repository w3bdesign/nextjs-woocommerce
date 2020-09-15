![Screenshot 1](./screenshots/screenshot1.jpg)

# Next.js Ecommerce site with Woocommerce backend

## Live URL: https://nextjs-woocommerce.now.sh/

1. Install and activate the following plugins, in your WordPress plugin directory:

- [woocommerce](https://wordpress.org/plugins/woocommerce) Ecommerce for Wordpress.
- [wp-graphql](https://github.com/wp-graphql/wp-graphql) Exposes graphql for WordPress.
- [wp-graphiql](https://github.com/wp-graphql/wp-graphiql) Provides GraphiQL IDE (playground) to the WP-Admin.
- [wp-graphql-woocommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) Adds Woocommerce functionality to a WPGraphQL schema.
- [algolia-woo-indexer](https://github.com/w3bdesign/algolia-woo-indexer) Sends WooCommerce products to Algolia.

2. For debugging and testing, install either:

   https://addons.mozilla.org/en-US/firefox/addon/apollo-developer-tools/ (Firefox)

   https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm (Chrome)   

   Rename .env.example to .env so the Apollo debugger will correctly load. It will not load if the NODE_ENV variable is not correctly set.

3. Make sure WooCommerce has some products already or import some sample products

   The WooCommerce sample products CSV file is available at `wp-content/plugins/woocommerce/sample-data/sample_products.csv` or [Sample products](sample_products/)

   Import the products at `WP Dashboard > Tools > Import > WooCommerce products(CSV)`

4. Clone or fork the repo and modify `nextConfig.js`
5. Modify the values according to your setup
6. Start the server with `npm run dev`
7. Enable COD (Cash On Demand) payment method in WooCommerce
8. Add a product to the cart
9. Proceed to checkout (Gå til kasse)
10. Fill in your details and place the order

## Features

- Connect to Woocommerce GraphQL API and list name, price and display image for products
- Support for simple products and variable products
- Cart handling and checkout with WooCommerce (Cash On Delivery only for now)
- Algolia search
- Meets WCAG accessibility standards where possible
- Placeholder for products without images
- Apollo Client with GraphQL
- React Hook Form with form validation and error display
- Animations with React-Spring and Animate.css
- Loading spinner created with Styled Components
- Shows page load progress with Nprogress during navigation
- Fully responsive design
- Category and product listings
- Pretty URLs with builtin Nextjs functionality
- Tailwind CSS for styling
- JSDoc comments
- WooCommerce cart session is automatically deleted after 48 hours to prevent GraphQL session expiration errors

## Known limitations

Overall the application is working as intended, but it has not been tested extensively in a production environment. 
More testing and debugging is required before deploying it in a production nevironment. 

With that said, keep the following in mind:

- Currently only simple products and variable products work without any issues. Other product types are not known to work.
- Only Cash On Delivery (COD) is currently supported. More payment methods may be added later.

## TODO

- Look into replacing nextConfig.js with https://vercel.com/docs/build-step#environment-variables
- Display product variation name in cart / checkout
- Hide products not in stock
- Add better SEO
- Implement https://github.com/cyrilwanner/next-optimized-images for production
