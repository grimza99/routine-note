'use client';
import { POLICIES } from '@/entities';

export default function PrivacyPage() {
  const privacyContent = POLICIES.privacy;
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-text-primary">{privacyContent?.title}</h3>
      <ul className="list-disc space-y-2 text-sm text-text-secondary">
        {privacyContent?.sections.map((section) => (
          <div key={`${privacyContent.title}-${section.title}`}>
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
