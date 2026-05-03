'use client';

import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <main className="overflow-auto">
        {children}
      </main>
    </div>
  );
}
