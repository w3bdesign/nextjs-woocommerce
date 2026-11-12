import type { Metadata } from 'next';

import Layout from '@/components/Layout/Layout.component';
import CheckoutForm from '@/components/Checkout/CheckoutForm.component';

export const metadata: Metadata = {
  title: 'Kasse',
};

export default function KassePage() {
  return (
    <Layout title="Kasse">
      <CheckoutForm />
    </Layout>
  );
}
