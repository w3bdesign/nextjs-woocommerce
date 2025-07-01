import Layout from '@/components/Layout/Layout.component';
import CustomerAccount from '@/components/User/CustomerAccount.component';
import withAuth from '@/components/User/withAuth.component';

import type { NextPage } from 'next';

const CustomerAccountPage: NextPage = () => {
  return (
    <Layout title="Min konto">
      <div className="container mx-auto px-4 py-8">
        <CustomerAccount />
      </div>
    </Layout>
  );
};

export default withAuth(CustomerAccountPage);
