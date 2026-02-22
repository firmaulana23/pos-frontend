import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - POS System',
  description: 'Login to your POS System account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}