import { PROJECT } from '@/shared';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-full flex-col items-center justify-center px-4 py-10 md:px-5 md:py-15 lg:px-8 lg:py-20 w-full gap-5">
      <Link
        href="/"
        className="rounded-xl bg-primary text-white p-3 md:px-6 md:py-4 flex items-center justify-center shadow-sm w-fit"
      >
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <img src="/icons/bolt.white.svg" alt="logo-icon" className="h-6 w-6 md:h-8 md:w-8" />
          {PROJECT.NAME}
        </h1>
      </Link>
      {children}
    </main>
  );
}
