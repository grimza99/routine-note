import GoalSetupGuard from '@/features/goal/model/GoalSetupGuard';
import { PageHeaderBanner } from '@/shared/ui';
import { Footer, Header } from '@/widgets';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col w-full relative min-h-screen">
      <Header />
      <main className="flex h-full flex-col items-center w-full mb-53">
        <PageHeaderBanner />
        <div className="px-4 py-10 md:px-5 md:py-10 lg:px-8 w-full max-w-250">{children}</div>
      </main>
      <GoalSetupGuard />
      <Footer />
    </div>
  );
}
