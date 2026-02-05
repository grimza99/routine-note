'use client';
import { LeaderBoard, useMyChallengeRank } from '@/entities';
import { PreparingCard, SummaryCard, Tabs } from '@/shared';
import { useState } from 'react';

type TabItem = 'leaderBoard' | 'challengeList';
const tabItems = [
  { id: 'leaderBoard', label: '리더 보드' },
  { id: 'challengeList', label: '진행 중인 챌린지' },
];

export default function ChallengePage() {
  const [activeTab, setActiveTab] = useState<TabItem>('leaderBoard');

  const { data: challengeData } = useMyChallengeRank(new Date().toISOString().slice(0, 7));

  const summaryData = [
    {
      title: '참가자',
      iconSrc: '/icons/calendar.svg',
      value: (challengeData?.totalParticipants || 0).toString(),
    },
    {
      title: '진행 중인 챌린지',
      iconSrc: '/icons/flame.svg',
      value: '준비중',
    },
    {
      title: '내 순위',
      iconSrc: '/icons/graph.svg',
      value: (challengeData?.rank || 0).toString(),
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
      <span className="text-text-secondary">한달간 가장 활발하게 운동한 유저들 이에요</span>
      <section>{activeTab === 'leaderBoard' ? <LeaderBoard /> : <PreparingCard />}</section>
    </div>
  );
}
