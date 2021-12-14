[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/w3bdesign/nextjs-woocommerce.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/w3bdesign/nextjs-woocommerce/context:javascript)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/29de6847b01142e6a0183988fc3df46a)](https://app.codacy.com/gh/w3bdesign/nextjs-woocommerce?utm_source=github.com&utm_medium=referral&utm_content=w3bdesign/nextjs-woocommerce&utm_campaign=Badge_Grade_Settings)
[![Maintainability](https://api.codeclimate.com/v1/badges/0dee1a2176d2f1455c14/maintainability)](https://codeclimate.com/github/w3bdesign/nextjs-woocommerce/maintainability)
[![CodeFactor](https://www.codefactor.io/repository/github/w3bdesign/nextjs-woocommerce/badge)](https://www.codefactor.io/repository/github/w3bdesign/nextjs-woocommerce)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=w3bdesign_nextjs-woocommerce&metric=alert_status)](https://sonarcloud.io/dashboard?id=w3bdesign_nextjs-woocommerce)

![Screenshot 1](./screenshots/screenshot1.jpg)

# NextJS Ecommerce site with WooCommerce backend

## Live URL: https://nextjs-woocommerce.dfweb.no

## Table Of Contents (TOC)

-   [Installation](#Installation)
-   [Features](#Features)
-   [Issues](#Issues)
-   [Troubleshooting](#Troubleshooting)
-   [TODO](#TODO)

## Installation

1. Install and activate the following required plugins, in your WordPress plugin directory:

- [woocommerce](https://wordpress.org/plugins/woocommerce) Ecommerce for WordPress.
- [wp-graphql](https://wordpress.org/plugins/wp-graphql) Exposes GraphQL for WordPress.
- [wp-graphql-woocommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) Adds WooCommerce functionality to a WPGraphQL schema.
- [algolia-woo-indexer](https://github.com/w3bdesign/algolia-woo-indexer) Sends WooCommerce products to Algolia. Required for search to work. 

Optional plugin:

- [headless-wordpress](https://github.com/w3bdesign/headless-wp) Disables the frontend so only the backend is accessible. (optional)

The current release has been tested and is confirmed working with the following versions:

- WordPress version 5.8.0
- WooCommerce version 5.9.0
- WP GraphQL version 1.2.4
- WooGraphQL version 0.6.1

2. For debugging and testing, install either:

   https://addons.mozilla.org/en-US/firefox/addon/apollo-developer-tools/ (Firefox)

   https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm (Chrome)   

   Rename .env.example to .env so the Apollo debugger will correctly load. It will not load if the NODE_ENV variable is not correctly set.

3. Make sure WooCommerce has some products already or import some sample products

   The WooCommerce sample products CSV file is available at `wp-content/plugins/woocommerce/sample-data/sample_products.csv` or [Sample products](sample_products/)

   Import the products at `WP Dashboard > Tools > Import > WooCommerce products(CSV)`

4. Clone or fork the repo and modify `nextConfig.js`. 

   Then set the environment variables ALGOLIA_APP_ID and ALGOLIA_PUBLIC_API_KEY in Vercel or your preferred hosting solution.
   
   See https://vercel.com/docs/environment-variables
   
5. Modify the values according to your setup
6. Start the server with `npm run dev`
7. Enable COD (Cash On Demand) payment method in WooCommerce
8. Add a product to the cart
9. Proceed to checkout (Gå til kasse)
10. Fill in your details and place the order

## Features

- NextJS version 12.0.7
- Connect to Woocommerce GraphQL API and list name, price and display image for products
- Support for simple products and variable products
- Cart handling and checkout with WooCommerce (Cash On Delivery only for now)
- Algolia search (requires [algolia-woo-indexer](https://github.com/w3bdesign/algolia-woo-indexer))
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

## Troubleshooting

### I am getting a cart undefined error or other GraphQL errors

Check that you are using the 0.6.1 version of the [wp-graphql-woocommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) plugin

### The products page isn't loading

Check the attributes of the products. Right now the application requires Size and Color.

## Issues

Overall the application is working as intended, but it has not been tested extensively in a production environment. 
More testing and debugging is required before deploying it in a production environment. 

With that said, keep the following in mind:

- Currently only simple products and variable products work without any issues. Other product types are not known to work.
- Only Cash On Delivery (COD) is currently supported. More payment methods may be added later.

## TODO

- Read https://www.react-spring.io/log and update React-spring to version 9
- Add total to cart/checkout page
- Show stock quantity on individual products
- Copy billing address to shipping address
- Display product variation name in cart / checkout
- Hide products not in stock
- Add better SEO
- Re-add Next/image when it is working better
