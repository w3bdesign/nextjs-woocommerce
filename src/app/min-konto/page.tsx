import type { Metadata } from 'next';

import CustomerAccountPage from '@/app/min-konto/CustomerAccountPage';

export const metadata: Metadata = {
  title: 'Min konto',
};

export default function MinKontoPage() {
  return <CustomerAccountPage />;
}
