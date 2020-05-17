<p align="center">
<img src="https://github.com/w3bdesign/nextjs-woocommerce/blob/master/screenshot.jpg?" alt="Screenshot"/>
<br />
<img src="https://github.com/w3bdesign/nextjs-woocommerce/blob/master/screenshot2.jpg?" alt="Screenshot"/>
</p>

# Next.js Ecommerce site with Woocommerce backend

Live url: <a href="https://nextjs-woocommerce.now.sh/">https://nextjs-woocommerce.now.sh/</a>

Clone or fork the repo and rename ```nextConfig.example.js``` to ```nextConfig.example```

Modify the values according to your setup

Follow this guide to generate API keys for your website: <a href="https://docs.woocommerce.com/document/woocommerce-rest-api/">https://docs.woocommerce.com/document/woocommerce-rest-api/</a>

Start the server with ```npm run dev ```

## Features

- Connect to Woocommerce GraphQL API and list name, price and display image for products (currently used on front page only)
- Vercel useSWR for caching and graphql-request for data fetching
- Animations with React-Spring
- Mobile menu and cart slide-out with animations
- List all product categories on a separate page
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