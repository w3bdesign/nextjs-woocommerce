/**
 * Site configuration
 * Centralized configuration for site-wide settings
 */

export const siteConfig = {
  name: 'MEBL FURNITURE',
  description: 'Premium furniture store with customizable 3D configurator',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mebl.furniture',

  mainNav: [
    {
      title: 'Products',
      href: '/products',
    },
    {
      title: 'Categories',
      href: '/categories',
    },
  ],

  authNav: {
    login: {
      title: 'Login',
      href: '/login',
    },
    register: {
      title: 'Register',
      href: '/register',
    },
    account: {
      title: 'My Account',
      href: '/my-account',
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
