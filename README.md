[![Lighthouse CI](https://img.shields.io/github/actions/workflow/status/w3bdesign/nextjs-woocommerce/lighthouse.yml?branch=master&label=Lighthouse%20CI&logo=lighthouse&logoColor=white)](https://github.com/w3bdesign/nextjs-woocommerce/actions/workflows/lighthouse.yml)
[![Playwright Tests](https://img.shields.io/github/actions/workflow/status/w3bdesign/nextjs-woocommerce/playwright.yml?branch=master&label=Playwright%20Tests&logo=playwright&logoColor=white)](https://github.com/w3bdesign/nextjs-woocommerce/actions/workflows/playwright.yml)
[![Codacy Badge](https://img.shields.io/codacy/grade/29de6847b01142e6a0183988fc3df46a?logo=codacy&logoColor=white)](https://app.codacy.com/gh/w3bdesign/nextjs-woocommerce?utm_source=github.com&utm_medium=referral&utm_content=w3bdesign/nextjs-woocommerce&utm_campaign=Badge_Grade_Settings)
[![CodeFactor](https://img.shields.io/codefactor/grade/github/w3bdesign/nextjs-woocommerce?logo=codefactor&logoColor=white)](https://www.codefactor.io/repository/github/w3bdesign/nextjs-woocommerce)
[![Quality Gate Status](https://img.shields.io/sonar/alert_status/w3bdesign_nextjs-woocommerce?server=https%3A%2F%2Fsonarcloud.io&logo=sonarcloud&logoColor=white)](https://sonarcloud.io/dashboard?id=w3bdesign_nextjs-woocommerce)

![bilde](https://github.com/user-attachments/assets/08047025-0950-472a-ae7d-932c7faee1db)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=w3bdesign/nextjs-woocommerce&type=Date)](https://star-history.com/#w3bdesign/nextjs-woocommerce&Date)

# Next.js Furniture Ecommerce with WooCommerce backend

**Polish Market Edition** - Currency auto-detection with PLN (zł) default

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

4.  Clone or fork the repo. For local development, copy `.env.example` to `.env.local` and adjust values.

Key variables:

- `NEXT_PUBLIC_GRAPHQL_URL` – Your WPGraphQL endpoint (e.g. https://yourwp.site/graphql)
- `NEXT_PUBLIC_ENABLE_MOCKS` – Set to `true` to run without a backend using in-app mocks
- Algolia (optional): `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_PUBLIC_API_KEY`, `NEXT_PUBLIC_ALGOLIA_INDEX_NAME`

This boilerplate also includes a `render.yaml` for Render.com deployment. On Render, set the above env vars in the service settings or rely on `render.yaml` prompts for secrets.

5.  Modify the values according to your setup

6.  Install dependencies and start the server

- `npm install`
- `npm run dev`

7.  Enable COD (Cash On Demand) payment method in WooCommerce

8.  Add a product to the cart

9.  Proceed to checkout

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
- UI Components:
  - **Shadcn/UI** - Modern, accessible component library built on Radix UI primitives
  - Customizable components with Tailwind CSS variants
  - Full TypeScript support with proper type inference
  - Accessible by default (WCAG compliant via Radix UI)
- Animations with Framer motion, Styled components and Animate.css
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
  - Price range slider (Shadcn Slider component)
  - Size and color filters (Shadcn Checkbox components)
  - Product type categorization
  - Sorting options (Shadcn DropdownMenu with RadioGroup)

## UI Component Architecture

This project uses [Shadcn/UI](https://ui.shadcn.com/) - a collection of re-usable components built with Radix UI and Tailwind CSS.

### Why Shadcn/UI?

- **Accessible by Default**: Built on Radix UI primitives ensuring WCAG compliance
- **Customizable**: Components are copied into your codebase, giving you full control
- **Type-Safe**: Full TypeScript support with proper type inference
- **Consistent Design**: Unified design system with Tailwind CSS
- **Performance**: Tree-shakeable and optimized bundle sizes

### Installed Components

Located in `/src/components/ui/`:

- **Form Controls**: Button, Input, Label, Checkbox, Slider
- **Layout**: Card, Table, Separator
- **Feedback**: Alert, Toast, Skeleton, Badge
- **Navigation**: Breadcrumb, DropdownMenu
- **Overlays**: Dialog, Sheet, Tooltip, Popover
- **Advanced**: Tabs, Accordion, AlertDialog

### Component Usage Examples

#### Button with Next.js Link

```tsx
import { Button } from '@/components/ui/button';
import Link from 'next/link';

<Button variant="default" asChild>
  <Link href="/products">Shop Now</Link>
</Button>;
```

#### Form with Shadcn Components

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
  <Button type="submit">Submit</Button>
</div>;
```

#### Toast Notifications

```tsx
import { useToast } from '@/components/ui/use-toast';

const { toast } = useToast();

toast({
  title: 'Success!',
  description: 'Product added to cart',
});
```

#### Table with Loading State

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

{
  loading ? (
    <TableBody>
      {[...Array(3)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  ) : (
    <TableBody>{/* Actual data */}</TableBody>
  );
}
```

### Customization

Components use CSS variables defined in `globals.css` for theming:

```css
:root {
  --primary: 210 40% 98%;
  --wood: 30 25% 45%;
  --fabric: 200 20% 60%;
  --metal: 220 15% 50%;
}
```

Modify these values or extend with your own custom colors in `tailwind.config.js`.

### Migration Patterns

When migrating from old components to Shadcn:

1. **Replace imports**: `@/components/UI/Button` → `@/components/ui/button`
2. **Use `asChild` pattern**: For Link wrapping with buttons
3. **Separate Label components**: Don't nest labels inside inputs
4. **Array values for ranges**: Slider uses `[min, max]` format
5. **Toast for notifications**: Replace inline success/error messages
6. **Skeleton for loading**: Match the structure of your loaded content

### Resources

- [Shadcn/UI Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS](https://tailwindcss.com/)

- Product filtering:

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

If you're running without a backend, ensure `NEXT_PUBLIC_ENABLE_MOCKS=true` is set in `.env.local` to use the built-in GraphQL mocks for development.

## Render.com Deployment

This repo includes a `render.yaml` Blueprint to deploy as a Node Web Service on Render.

- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Node version: pinned via `.node-version` (22.16.0) or set `NODE_VERSION` env var on Render
- Required environment variables: `NEXT_PUBLIC_GRAPHQL_URL` (your WPGraphQL endpoint)
- Optional: Algolia keys and index name

Steps:

1. Push your repo to GitHub/GitLab/Bitbucket.
2. In Render Dashboard: New > Blueprint > select your repo containing `render.yaml`.
3. When prompted, provide secret values for variables marked with `sync: false` (e.g., `NEXT_PUBLIC_GRAPHQL_URL`).
4. Finish creation; Render will build and run the service at an `onrender.com` URL.

Notes:

- SSR and API routes run on Render’s Node runtime. The app binds to the default `PORT` provided by Render automatically via `next start`.
- If your WooCommerce/WordPress is behind auth or firewalls, allow Render to access it or proxy accordingly.
- For preview environments or temporary lack of backend, set `NEXT_PUBLIC_ENABLE_MOCKS=true` to serve mock catalog data.

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
