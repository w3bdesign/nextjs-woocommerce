'use client';

import { redirect } from 'next/navigation';
import { ComponentType } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '@/utils/gql/GQL_QUERIES';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

/**
 * Protects a page behind WooCommerce authentication.
 *
 * The WooCommerce session cookie lives on the WordPress origin, so the Next.js
 * server cannot read it and authentication must be checked from the browser.
 * Instead of pushing a new route from an effect (which renders the page first and
 * then navigates), `redirect()` is called during render. Next.js handles this
 * as a navigation and replaces the history entry, so the back button does not
 * loop back to the protected page.
 */
const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const { data, loading, error } = useQuery(GET_CURRENT_USER, {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    });

    // Show loading while checking authentication
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      );
    }

    if (error || !data?.customer) {
      redirect('/logg-inn');
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
