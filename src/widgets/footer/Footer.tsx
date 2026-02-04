'use client';

import { useMemo, useState } from 'react';
import { Modal, PROJECT } from '@/shared';
import { POLICIES } from '@/entities';

type PolicyKey = keyof typeof POLICIES;

export default function Footer() {
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null);

  const modalData = useMemo(() => (activePolicy ? POLICIES[activePolicy] : null), [activePolicy]);

  return (
    <footer className="bg-gray900 text-white">
      <div className="mx-auto flex w-full max-w-300 flex-col items-center gap-10 px-6 py-15 md:py-20 ">
        <div className="flex md:justify-between w-full flex-col md:flex-row gap-6 items-center">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <img src="/icons/bolt.white.svg" alt="logo-icon" className="h-7 w-7" />
            {PROJECT.NAME}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm font-semibold text-text-secondary">
            <button type="button" onClick={() => setActivePolicy('terms')}>
              이용약관
            </button>
            <button type="button" onClick={() => setActivePolicy('privacy')}>
              개인정보 처리방침
            </button>
            <button type="button" onClick={() => setActivePolicy('cookie')}>
              쿠키 정책
            </button>
            <button type="button" onClick={() => setActivePolicy('contact')}>
              문의
            </button>
          </div>
        </div>
        <div className="text-sm text-text-secondary">© 2026 {PROJECT.NAME}. All rights reserved.</div>
      </div>

      <Modal modalId="footer-policy-modal" isOpen={Boolean(modalData)} onClose={() => setActivePolicy(null)}>
        <div className="flex flex-col gap-4 px-6 py-8">
          <h3 className="text-lg font-semibold text-text-primary">{modalData?.title}</h3>
          <ul className="list-disc space-y-2 text-sm text-text-secondary">
            {modalData?.sections.map((section) => (
              <div key={`${modalData.title}-${section.title}`}>
                <h5 key={section.title} className="mt-4 text-lg font-semibold text-text-primary">
                  {section.title}
                </h5>
                <ul className="list-disc space-y-1 pl-5 mt-2">
                  {section.items.map((line) => (
                    <li key={`${line}`}>{line}</li>
                  ))}
                </ul>
              </div>
            ))}
          </ul>
        </div>
      </Modal>
    </footer>
  );
}
