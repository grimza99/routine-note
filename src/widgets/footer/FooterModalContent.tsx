import { POLICIES } from '@/entities';
import { useMemo } from 'react';
type PolicyKey = keyof typeof POLICIES;

interface FooterModalContentProps {
  activePolicy: PolicyKey | null;
}
export default function FooterModalContent({ activePolicy }: FooterModalContentProps) {
  const modalData = useMemo(() => (activePolicy ? POLICIES[activePolicy] : null), [activePolicy]);

  return (
    <div className="flex flex-col gap-4 px-6 py-8">
      <h3 className="text-2xl font-semibold text-text-primary">{modalData?.title}</h3>
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
  );
}
