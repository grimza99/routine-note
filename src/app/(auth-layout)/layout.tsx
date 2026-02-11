import { PROJECT } from '@/shared';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex h-full flex-col items-center justify-center bg-gray-100 px-4 py-10 md:px-5 md:py-15 lg:px-8 lg:py-20 w-full gap-5">
      <div className="rounded-xl bg-primary text-white px-6 py-4 flex items-center justify-center shadow-sm w-fit">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <img src="/icons/bolt.white.svg" alt="logo-icon" className="h-10 w-10" />
          {PROJECT.NAME}
        </h1>
      </div>
      {children}
    </main>
  );
}
