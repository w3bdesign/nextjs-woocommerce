import Layout from '@/components/Layout/Layout.component';
import CheckoutForm from '@/components/Checkout/CheckoutForm.component';

const Kasse: NextPage = () => (
  <Layout title="Kasse">
    <div className="px-1">
      <CheckoutForm />
    </div>
  </Layout>
);

export default Kasse;
