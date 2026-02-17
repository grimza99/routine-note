// mobile 에서 WebFallbackScreen 을 이용해 웹뷰로 보여지는 페이지의 Layout.
export default function WebViewLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="px-4 py-10 w-full">{children}</main>;
}
