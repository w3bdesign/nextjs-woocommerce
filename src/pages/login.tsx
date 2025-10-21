import Layout from '@/components/Layout/Layout.component';
import UserLogin from '@/components/User/UserLogin.component';

import type { NextPage } from 'next';

const LoginPage: NextPage = () => {
  return (
    <Layout title="Login">
      <div className="container mx-auto px-4 py-8">
        <UserLogin />
      </div>
    </Layout>
  );
};

export default LoginPage;
