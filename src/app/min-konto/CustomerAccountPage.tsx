'use client';

import Layout from '@/components/Layout/Layout.component';
import CustomerAccount from '@/components/User/CustomerAccount.component';
import withAuth from '@/components/User/withAuth.component';

const CustomerAccountContent = () => (
  <Layout title="Min konto">
    <div className="container mx-auto px-4 py-8">
      <CustomerAccount />
    </div>
  </Layout>
);

// withAuth is a client-side HOC (hooks + client redirect), so it must be
// applied inside a Client Component module.
export default withAuth(CustomerAccountContent);
