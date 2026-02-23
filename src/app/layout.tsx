import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { ModalBridgeProvider, ToastProvider } from '@/shared/ui';
import { QueryProvider } from '@/shared/libs';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Workout Note',
  description: '내 운동 루틴을 기록하고, 다른 사용자와 공유해보세요!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-full`}>
        <ToastProvider>
          <QueryProvider>
            <ModalBridgeProvider>{children}</ModalBridgeProvider>
          </QueryProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
