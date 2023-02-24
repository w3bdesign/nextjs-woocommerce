// Components
import Layout from '@/components/Layout/Layout.component';
import CartContents from '@/components/Cart/CartContents.component';

// Types
import type { NextPage } from 'next';

const Handlekurv: NextPage = () => (
  <Layout title="Handlekurv">
    <CartContents />
  </Layout>
);

export default Handlekurv;
