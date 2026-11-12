import { NextResponse, type NextRequest } from 'next/server';

/**
 * Legacy product URLs (`/produkt/:slug?id=...`) permanently redirect (301) to
 * the clean slug URL. This replaces the redirect previously done in
 * `getServerSideProps` of `pages/produkt/[slug].tsx`.
 *
 * `permanentRedirect()` in a page would respond with 308, so a proxy is used
 * to keep the exact 301 status code for SEO.
 */
export function proxy(request: NextRequest) {
  if (!request.nextUrl.searchParams.has('id')) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.search = '';
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: '/produkt/:slug',
};
