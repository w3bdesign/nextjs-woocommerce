'use client';

import { useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '@/utils/gql/GQL_QUERIES';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner.component';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const router = useRouter();

    const { data, loading, error } = useQuery(GET_CURRENT_USER, {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    });

    const isAuthenticated = !error && Boolean(data?.customer);

    // Navigation is a side effect on an external system (the router), so it belongs in an effect.
    useEffect(() => {
      if (!loading && !isAuthenticated) {
        router.push('/logg-inn');
      }
    }, [loading, isAuthenticated, router]);

    // Show loading while checking authentication
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      );
    }

    // Not authenticated: render nothing while the redirect happens
    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
