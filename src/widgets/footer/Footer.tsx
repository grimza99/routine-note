'use client';

import { PROJECT } from '@/shared/constants';
import { useModal } from '@/shared/hooks';

export default function Footer() {
  const { openModal } = useModal();

  return (
    <footer className="absolute bottom-0 md:h-53 w-full bg-gray900 text-text-secondary">
      <div className="mx-auto flex w-full max-w-300 flex-col items-center gap-10 px-6 py-10 md:py-15 ">
        <div className="flex md:justify-between w-full flex-col md:flex-row gap-6 items-center">
          <h1 className="text-xl text-white md:text-2xl font-bold flex items-center gap-3">
            <img src="/icons/bolt.white.svg" alt="logo-icon" className="w-5 h-5 md:h-7 md:w-7" />
            {PROJECT.NAME}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm font-semibold ">
            <button type="button" onClick={() => openModal('terms')}>
              이용약관
            </button>
            <button type="button" onClick={() => openModal('privacy')}>
              개인정보 처리방침
            </button>
            <button type="button" onClick={() => openModal('cookie')}>
              쿠키 정책
            </button>
            <button type="button" onClick={() => openModal('contact')}>
              문의
            </button>
          </div>
        </div>
        <div className="text-sm ">© 2026 {PROJECT.NAME}. All rights reserved.</div>
      </div>
    </footer>
  );
}
