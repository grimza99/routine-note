'use client';
import { Rank } from '@/entities';
import { SummaryCard, Tabs } from '@/shared';
import { useState } from 'react';

type TabItem = 'dashboard' | 'challengeList';
const tabItems = [
  { id: 'dashboard', label: '대시 보드' },
  { id: 'challengeList', label: '진행 중인 챌린지' },
];

export default function ChallengePage() {
  const [activeTab, setActiveTab] = useState<TabItem>('dashboard');

  const summaryData = [
    {
      title: '참가자',
      iconSrc: '/icons/calendar.svg',
      value: (0).toString(),
    },
    {
      title: '진행 중인 챌린지',
      iconSrc: '/icons/flame.svg',
      value: (0).toString(),
    },
    {
      title: '내 순위',
      iconSrc: '/icons/graph.svg',
      value: (0).toString(),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-wrap gap-4 w-full">
        {summaryData.map((data) => (
          <SummaryCard
            key={data.title}
            title={data.title}
            iconSrc={data.iconSrc}
            value={data.value}
            variant="secondary"
            className="flex-1"
          />
        ))}
      </section>
      <section>
        <Tabs items={tabItems} activeId={activeTab} onChange={(id) => setActiveTab(id as TabItem)} />
      </section>
      <section>
        <Rank imageUrl="" nickname="닉네임 테스트" experience="2000" rank={1} streakDays={20} />
      </section>
    </div>
  );
}
