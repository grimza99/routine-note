'use client';
import { usePathname } from 'next/navigation';

const EXCLUDE_PATHS = ['password-reset', 'privacy'];

type TPageHeaderBannerVariant = 'routine-cal' | 'manage' | 'mypage' | 'report' | 'challenge';

interface PageHeaderBannerContent {
  title: string;
  subtitle: string;
}

const PAGE_HEADER_BANNER_CONTENT: Record<TPageHeaderBannerVariant, PageHeaderBannerContent> = {
  'routine-cal': {
    title: '루틴 캘린더',
    subtitle: '나의 루틴을 기록하세요!',
  },
  manage: {
    title: '나의 루틴',
    subtitle: '나의 루틴을 체계적으로 관리해보세요!',
  },
  mypage: {
    title: '마이 페이지',
    subtitle: '나의 프로필과 설정',
  },
  report: {
    title: '리포트',
    subtitle: '나의 성장을 확인 하세요',
  },
  challenge: {
    title: '챌린지',
    subtitle: '다른 유저와 경쟁 해보세요!',
  },
};

export default function PageHeaderBanner() {
  const pathname = usePathname().split('/');
  if (EXCLUDE_PATHS.includes(pathname[pathname.length - 1])) {
    return null;
  }
  const variant = pathname[pathname.length - 1] as TPageHeaderBannerVariant;
  const { title, subtitle } = PAGE_HEADER_BANNER_CONTENT[variant];

  return (
    <section className="w-full hidden md:flex h-40 lg:h-48 bg-primary text-white px-8 lg:px-16 flex-col justify-center gap-3 font-bold">
      <h1 className="text-4xl">{title}</h1>
      <p className="text-xl">{subtitle}</p>
    </section>
  );
}
