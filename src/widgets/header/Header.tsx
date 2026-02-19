'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Button, PROJECT, useOnClickOutside } from '@/shared';
import { useLogoutMutation } from '@/features/auth/model/auth.mutation';

type HeaderNavItem = {
  label: string;
  href: string;
};

const navItems: HeaderNavItem[] = [
  { label: '캘린더', href: '/routine/routine-cal' },
  { label: '루틴', href: '/routine/manage' },
  { label: '챌린지', href: '/challenge' },
  { label: '리포트', href: '/report' },
  { label: '마이페이지', href: '/mypage' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement | null>(null);

  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);
  const handleCloseMenu = () => setIsMenuOpen(false);

  useOnClickOutside(menuRef, handleCloseMenu, { enabled: isMenuOpen });
  const { mutateAsync: logout } = useLogoutMutation();

  return (
    <header className="sticky top-0 z-10 w-full bg-gray900">
      <div className="mx-auto flex w-full max-w-300 items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-gray-100" onClick={handleCloseMenu}>
          <img src="/icons/bolt.svg" alt="Logo" className="inline h-6 w-6 mr-2" />
          {PROJECT.NAME}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {item.label}
            </Link>
          ))}
          <Button label="로그아웃" onClick={async () => await logout()} variant="primary" className="w-fit" />
        </nav>

        <button
          type="button"
          className="md:hidden"
          aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMenuOpen}
          onClick={handleToggleMenu}
        >
          <img src="/icons/bars.svg" alt="Menu" className="h-6 w-6" />
        </button>
      </div>

      <div
        className={`fixed inset-0 z-20 transition-opacity md:hidden ${
          isMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="absolute inset-0 h-full w-full" style={{ background: 'rgba(0, 0, 0, 0.35)' }} />
        <aside
          ref={menuRef}
          className={`absolute right-0 top-0 h-full w-[80%] max-w-80 transform transition-transform bg-gray900 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-end px-4 py-4">
            <button type="button" className="h-8 w-8" onClick={handleCloseMenu} aria-label="메뉴 닫기">
              <img src="/icons/x.mark.primary.svg" alt="Close Menu" className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-4 gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-semibold text-lg text-text-secondary py-2"
                style={{ color: 'var(--text-secondary)' }}
                onClick={handleCloseMenu}
              >
                {item.label}
              </Link>
            ))}
            <Button label="로그아웃" onClick={async () => await logout()} variant="primary" className="w-fit text-lg" />
          </nav>
        </aside>
      </div>
    </header>
  );
}
