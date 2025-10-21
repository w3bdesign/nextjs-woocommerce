// Components
import Layout from '@/components/Layout/Layout.component';
import CheckoutForm from '@/components/Checkout/CheckoutForm.component';

// Types
import type { NextPage } from 'next';

const Checkout: NextPage = () => (
  <Layout title="Checkout">
    <CheckoutForm />
  </Layout>
);

export default Checkout;
