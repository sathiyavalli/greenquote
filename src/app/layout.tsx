import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';

export const metadata: Metadata = {
  title: 'GreenQuote - Solar Financing',
  description: 'Get pre-qualified for solar financing in minutes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
