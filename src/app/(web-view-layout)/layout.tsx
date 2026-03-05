import { AuthHydrator } from './_m/AuthHydrator';

// mobile 에서 WebFallbackScreen 을 이용해 웹뷰로 보여지는 페이지의 Layout.
export default function WebViewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="p-4 w-full">
      <AuthHydrator />

      {children}
    </main>
  );
}
