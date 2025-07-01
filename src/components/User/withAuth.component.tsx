import { useRouter } from 'next/router';
import { useEffect, ComponentType } from 'react';
import { hasCredentials } from '../../utils/auth';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const router = useRouter();

    useEffect(() => {
      if (!hasCredentials()) {
        router.push('/logg-inn');
      }
    }, [router]);

    if (!hasCredentials()) {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
