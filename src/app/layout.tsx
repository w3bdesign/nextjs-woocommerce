import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import Providers from '@/app/providers';

import '@/styles/globals.css';

const SITE_TITLE = 'Next.js webshop with WooCommerce';

/**
 * Default metadata for every route.
 * Pages set `title` and it is rendered as "Next.js webshop with WooCommerce <title>",
 * matching the previous <Header> behaviour in the Pages Router.
 */
export const metadata: Metadata = {
  title: {
    template: `${SITE_TITLE} %s`,
    default: SITE_TITLE,
  },
  description: 'WooCommerce webshop',
  keywords: ['Ecommerce', 'WooCommerce'],
  openGraph: {
    title: 'Nextjs Ecommerce with Woocommerce',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nb-NO">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
