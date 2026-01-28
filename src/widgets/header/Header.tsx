'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { PROJECT, useOnClickOutside } from '@/shared';

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

  return (
    <header
      className="sticky top-0 z-10 w-full border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
    >
      <div className="mx-auto flex w-full max-w-300 items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold" style={{ color: 'var(--text-primary)' }} onClick={handleCloseMenu}>
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
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden border border-(--primary) bg-(--white)"
          aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isMenuOpen}
          onClick={handleToggleMenu}
        >
          <img src="icons/bars.svg" alt="Menu" className="h-5 w-5" />
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
          className={`absolute right-0 top-0 h-full w-[80%] max-w-[320px] transform border-l transition-transform ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ borderColor: 'var(--border)', background: 'var(--background)' }}
        >
          <div className="flex justify-end px-6 py-4">
            <button type="button" className="h-6 w-6" onClick={handleCloseMenu} aria-label="메뉴 닫기">
              <img src="/icons/x.mark.svg" alt="Close Menu" className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-3 text-sm font-semibold"
                style={{ color: 'var(--text-secondary)' }}
                onClick={handleCloseMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </header>
  );
}
