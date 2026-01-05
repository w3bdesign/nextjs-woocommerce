![Lighthouse CI](https://img.shields.io/github/actions/workflow/status/w3bdesign/nextjs-woocommerce/lighthouse.yml?branch=master&label=Lighthouse%20CI&logo=lighthouse&logoColor=white)](https://github.com/w3bdesign/nextjs-woocommerce/actions/workflows/lighthouse.yml)
[![Playwright Tests](https://img.shields.io/github/actions/workflow/status/w3bdesign/nextjs-woocommerce/playwright.yml?branch=master&label=Playwright%20Tests&logo=playwright&logoColor=white)](https://github.com/w3bdesign/nextjs-woocommerce/actions/workflows/playwright.yml)
[![Codacy Badge](https://img.shields.io/codacy/grade/29de6847b01142e6a0183988fc3df46a?logo=codacy&logoColor=white)](https://app.codacy.com/gh/w3bdesign/nextjs-woocommerce?utm_source=github.com&utm_medium=referral&utm_content=w3bdesign/nextjs-woocommerce&utm_campaign=Badge_Grade_Settings)
[![CodeFactor](https://img.shields.io/codefactor/grade/github/w3bdesign/nextjs-woocommerce?logo=codefactor&logoColor=white)](https://www.codefactor.io/repository/github/w3bdesign/nextjs-woocommerce)
[![Quality Gate Status](https://img.shields.io/sonar/alert_status/w3bdesign_nextjs-woocommerce?server=https%3A%2F%2Fsonarcloud.io&logo=sonarcloud&logoColor=white)](https://sonarcloud.io/dashboard?id=w3bdesign_nextjs-woocommerce)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

![bilde](https://github.com/user-attachments/assets/08047025-0950-472a-ae7d-932c7faee1db)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=w3bdesign/nextjs-woocommerce&type=Date)](https://star-history.com/#w3bdesign/nextjs-woocommerce&Date)

# Next.js Ecommerce site with WooCommerce backend

## Live URL: <https://next-woocommerce.dfweb.no>

## Table Of Contents (TOC)

- [Installation](#Installation)
- [Features](#Features)
- [Lighthouse Performance Monitoring](#lighthouse-performance-monitoring)
- [Issues](#Issues)
- [Troubleshooting](#Troubleshooting)
- [TODO](#TODO)
- [Future Improvements](SUGGESTIONS.md)

## Installation

1.  Install and activate the following required plugins, in your WordPress plugin directory:

- [woocommerce](https://wordpress.org/plugins/woocommerce) Ecommerce for WordPress.
- [wp-graphql](https://wordpress.org/plugins/wp-graphql) Exposes GraphQL for WordPress.
- [wp-graphql-woocommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) Adds WooCommerce functionality to a WPGraphQL schema.
- [wp-algolia-woo-indexer](https://github.com/w3bdesign/wp-algolia-woo-indexer) WordPress plugin coded by me. Sends WooCommerce products to Algolia. Required for search to work.

Optional plugin:

- [headless-wordpress](https://github.com/w3bdesign/headless-wp) Disables the frontend so only the backend is accessible. (optional)

The current release has been tested and is confirmed working with the following versions:

- WordPress version 6.8.1
- WooCommerce version 9.9.5
- WP GraphQL version 2.3.3
- WooGraphQL version 0.19.0
- WPGraphQL CORS version 2.1

2.  For debugging and testing, install either:

    <https://addons.mozilla.org/en-US/firefox/addon/apollo-developer-tools/> (Firefox)

    <https://chrome.google.com/webstore/detail/apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm> (Chrome)

3.  Make sure WooCommerce has some products already

4.  Clone or fork the repo and modify `.env.example` and rename it to `.env`

    Then set the environment variables accordingly in Vercel or your preferred hosting solution.

    See <https://vercel.com/docs/environment-variables>

5.  Modify the values according to your setup

6.  Start the server with `npm run dev`

7.  Enable COD (Cash On Demand) payment method in WooCommerce

8.  Add a product to the cart

9.  Proceed to checkout (Gå til kasse)

10. Fill in your details and place the order

## Features

- Next.js version 15.1.7
- React version 18.3.1
- Typescript
- Tests with Playwright
- Connect to Woocommerce GraphQL API and list name, price and display image for products
- Support for simple products and variable products
- Cart handling and checkout with WooCommerce using Zustand for state management
  - Persistent cart state with localStorage sync
  - Efficient updates through selective subscriptions
  - Type-safe cart operations
  - Cash On Delivery payment method
- Algolia search (requires [algolia-woo-indexer](https://github.com/w3bdesign/algolia-woo-indexer))
- Meets WCAG accessibility standards where possible
- Placeholder for products without images
- State Management:
  - Zustand for global state management
  - Apollo Client with GraphQL
- React Hook Form
- Native HTML5 form validation
- Animations with Framer motion, Styled components and Animate.css
- Loading spinner created with Styled Components
- Shows page load progress with Nprogress during navigation
- Fully responsive design
- Category and product listings
- Show stock status
- Pretty URLs with builtin Nextjs functionality
- Tailwind 3 for styling
- JSDoc comments
- Automated Lighthouse performance monitoring
  - Continuous performance, accessibility, and best practices checks
  - Automated reports on every pull request
  - Performance metrics tracking for:
    - Performance score
    - Accessibility compliance
    - Best practices adherence
    - SEO optimization
    - Progressive Web App readiness
- Product filtering:
  - Dynamic color filtering using Tailwind's color system
  - Mobile-optimized filter layout
  - Accessible form controls with ARIA labels
  - Price range slider
  - Size and color filters
  - Product type categorization
  - Sorting options (popularity, price, newest)

## Lighthouse Performance Monitoring

This project uses automated Lighthouse testing through GitHub Actions to ensure high-quality web performance. On every pull request:

- Performance, accessibility, best practices, and SEO are automatically evaluated
- Results are posted directly to the pull request
- Minimum score thresholds are enforced for:
  - Performance: Analyzing loading performance, interactivity, and visual stability
  - Accessibility: Ensuring WCAG compliance and inclusive design
  - Best Practices: Validating modern web development standards
  - SEO: Checking search engine optimization fundamentals
  - PWA: Assessing Progressive Web App capabilities

View the latest Lighthouse results in the GitHub Actions tab under the "Lighthouse Check" workflow.

## Troubleshooting

### I am getting a cart undefined error or other GraphQL errors

Check that you are using the 0.12.0 version of the [wp-graphql-woocommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) plugin

### The products page isn't loading

Check the attributes of the products. Right now the application requires Size and Color.

## Issues

Overall the application is working as intended, but it has not been tested extensively in a production environment.
More testing and debugging is required before deploying it in a production environment.

With that said, keep the following in mind:

- Currently only simple products and variable products work without any issues. Other product types are not known to work.
- Only Cash On Delivery (COD) is currently supported. More payment methods may be added later.

This project is tested with BrowserStack.

## TODO

- Implement UserRegistration.component.tsx in a registration page
- Add user dashboard with order history
- Add Cloudflare Turnstile on registration page
- Ensure email is real on registration page
- Add total to cart/checkout page
- Copy billing address to shipping address
- Hide products not in stock
