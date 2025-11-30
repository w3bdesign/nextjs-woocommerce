import Layout from '@/components/Layout/Layout.component';
import UserRegistration from '@/components/User/UserRegistration.component';
import type { NextPage } from 'next';
import { ReactElement } from 'react';

const RegisterPage: NextPage = (): ReactElement => {
  return (
    <Layout title="Register | Mebl">
      <div className="container mx-auto max-w-md px-4 py-16">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-wide uppercase">
          Create Your Account
        </h1>
        <UserRegistration />
      </div>
    </Layout>
  );
};

export default RegisterPage;
