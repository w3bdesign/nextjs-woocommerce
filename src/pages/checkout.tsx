// Components
import CheckoutForm from '@/components/Checkout/CheckoutForm.component';
import BreadcrumbNav from '@/components/Layout/BreadcrumbNav.component';
import Layout from '@/components/Layout/Layout.component';

// Types
import type { NextPage } from 'next';

const Checkout: NextPage = () => (
  <Layout title="Checkout">
    <BreadcrumbNav
      items={[
        { label: 'Home', href: '/' },
        { label: 'Cart', href: '/cart' },
        { label: 'Checkout' },
      ]}
    />
    <CheckoutForm />
  </Layout>
);

export default Checkout;
