<p align="center">
<img src="https://github.com/w3bdesign/nextjs-woocommerce/blob/master/screenshot.jpg?" alt="Screenshot"/>
<br />
<img src="https://github.com/w3bdesign/nextjs-woocommerce/blob/master/screenshot2.jpg?" alt="Screenshot"/>
</p>

# Next.js Ecommerce site with Woocommerce backend

## This is still a work in progress

Live url: <a href="https://nextjs-woocommerce.now.sh/">https://nextjs-woocommerce.now.sh/</a>

1. Clone and activate the following plugins , in your WordPress plugin directory:

* [wp-graphql](https://github.com/wp-graphql/wp-graphql) Exposes graphql for WordPress ( **Tested with v-0.8.0** of this plugin )
* [wp-graphiql](https://github.com/wp-graphql/wp-graphiql) Provides GraphiQL IDE (playground) to the WP-Admin.
* [wp-graphql-woocommerce](https://github.com/wp-graphql/wp-graphql-woocommerce) Adds Woocommerce functionality to a WPGraphQL schema ( **Tested with v-0.5.0** of this plugin )

You can also import default wooCommerce products that come with wooCommerce Plugin for development ( if you don't have any products in your WordPress install ) `WP Dashboard > Tools > Import > WooCommerce products(CSV)`: The WooCommerce default products csv file is available at `wp-content/plugins/woocommerce/sample-data/sample_products.csv`

2. Clone or fork the repo and modify ```nextConfig.js```
3. Modify the values according to your setup

Start the server with ```npm run dev ```

## Features

- Connect to Woocommerce GraphQL API and list name, price and display image for products (currently used on front page only)
- Vercel useSWR for caching and graphql-request for data fetching
- Animations with React-Spring
- Mobile menu and cart slide-out with animations
- List all product categories on a separate page
- Link to individual product
- API support for creating new Woocommerce orders (not connected to cart contents yet)
- Tailwind CSS for styling
- Minimalistic and responsive design
- Currently connected to live Woocommerce installation instead of using a local installation

## TODO

- Hide products not in stock
- Add Algolia search 
- Add a better README.md
- Implement https://github.com/cyrilwanner/next-optimized-images for production
- Implement Easy Peasy for cart state management
- Add more functionality