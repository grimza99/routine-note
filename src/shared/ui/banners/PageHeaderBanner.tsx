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
    title: 'Workout Calendar',
    subtitle: '나의 루틴으로 운동기록하기',
  },
  manage: {
    title: 'Routine',
    subtitle: '나의 루틴 관리',
  },
  mypage: {
    title: 'My Page',
    subtitle: '나의 프로필과 설정',
  },
  report: {
    title: 'Report',
    subtitle: '운동 리포트',
  },
  challenge: {
    title: 'Challenge',
    subtitle: '다른 유저와 경쟁하며 동기부여',
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
    <section className="w-full hidden md:flex h-30 lg:h-45 bg-white text-primary italic items-center justify-center font-bold text-center">
      <div className="mx-auto flex flex-col w-full max-w-300 px-6 py-4 gap-3">
        <h1 className="text-3xl">{title}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}
