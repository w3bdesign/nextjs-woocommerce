import type { Metadata } from 'next';

import Layout from '@/components/Layout/Layout.component';
import UserLogin from '@/components/User/UserLogin.component';

export const metadata: Metadata = {
  title: 'Logg inn',
};

export default function LoginPage() {
  return (
    <Layout title="Logg inn">
      <div className="container mx-auto px-4 py-8">
        <UserLogin />
      </div>
    </Layout>
  );
}
