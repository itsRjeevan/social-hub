import type { Metadata } from 'next';
import './globals.css';
import { MainLayout } from '@/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Social Hub — All-in-One Social Media Management Dashboard',
  description: 'Manage Facebook pages, Instagram accounts, and YouTube channels with unified tasks, calendar, content library, and analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-[#182230] bg-[#F7F8FC]">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
