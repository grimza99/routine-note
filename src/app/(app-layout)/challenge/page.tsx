'use client';
import { LeaderBoard } from '@/entities';
import { PreparingCard, SummaryCard, Tabs } from '@/shared';
import { useState } from 'react';

type TabItem = 'leaderBoard' | 'challengeList';
const tabItems = [
  { id: 'leaderBoard', label: '리더 보드' },
  { id: 'challengeList', label: '진행 중인 챌린지' },
];

export default function ChallengePage() {
  const [activeTab, setActiveTab] = useState<TabItem>('leaderBoard');

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
      <section>{activeTab === 'leaderBoard' ? <LeaderBoard /> : <PreparingCard />}</section>
    </div>
  );
}
