import { Header } from '@/widgets';
import type { Metadata } from 'next';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />

      <main className="flex justify-center">
        <div className="px-4 py-10 md:px-5 md:py-15 lg:px-8 lg:py-20 w-full max-w-250">{children}</div>
      </main>
    </>
  );
}
