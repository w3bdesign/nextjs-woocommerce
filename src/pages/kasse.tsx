// Components
import Layout from '@/components/Layout/Layout.component';
import CheckoutForm from '@/components/Checkout/CheckoutForm.component';

// Types
import type { NextPage } from 'next';

const Kasse: NextPage = () => (
  <Layout title="Kasse">
    <CheckoutForm />
  </Layout>
);

export default Kasse;
