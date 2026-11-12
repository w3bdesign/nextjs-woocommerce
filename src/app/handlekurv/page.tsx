import type { Metadata } from 'next';

import Layout from '@/components/Layout/Layout.component';
import CartContents from '@/components/Cart/CartContents.component';

export const metadata: Metadata = {
  title: 'Handlekurv',
};

export default function HandlekurvPage() {
  return (
    <Layout title="Handlekurv">
      <CartContents />
    </Layout>
  );
}
