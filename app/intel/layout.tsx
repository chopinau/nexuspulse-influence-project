import React from 'react';
import '../[locale]/globals.css'; // Import global styles if needed, or just basic setup

export const metadata = {
  title: 'NexusPulse Intelligence',
  description: 'Automated Intelligence Reports',
};

export default function IntelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen">
        <main className="max-w-4xl mx-auto py-10 px-4">
            {children}
        </main>
      </body>
    </html>
  );
}
