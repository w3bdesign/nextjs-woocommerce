// Components
import Layout from '@/components/Layout/Layout.component';
import CartContents from '@/components/Cart/CartContents.component';

// Types
import type { NextPage } from 'next';

const Cart: NextPage = () => (
  <Layout title="Cart">
    <CartContents />
  </Layout>
);

export default Cart;
