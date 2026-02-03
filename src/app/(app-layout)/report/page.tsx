'use client';
import { useWorkoutQuery } from '@/entities';
import { SummaryCard, Tabs } from '@/shared';
import { useState } from 'react';

const tabItems = [
  { id: 'current', label: '이번 달 리포트' },
  { id: 'prev', label: '지난 리포트' },
];

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<'prev' | 'current'>('current');
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: monthlyReportData } = useWorkoutQuery(currentMonth);

  const summaryData = [
    {
      title: '완료 일수',
      iconSrc: '/icons/calendar.svg',
      value: (monthlyReportData?.workoutDays || 0).toString(),
    },
    {
      title: '최대 연속',
      iconSrc: '/icons/flame.svg',
      value: (monthlyReportData?.maxConsecutiveWorkoutDays || 0).toString(),
    },
    {
      title: '달성률',
      iconSrc: '/icons/goal.svg',
      value: (monthlyReportData?.goalAchievementRate || 0) + '%',
    },
    {
      title: '체지방량 변화',
      iconSrc: '/icons/graph.svg',
      value: (monthlyReportData?.bodyFatMassChange || 0).toString(),
    },
  ];

  return (
    <div>
      <Tabs items={tabItems} activeId={activeTab} onChange={(id) => setActiveTab(id as 'prev' | 'current')} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
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
      </div>
    </div>
  );
}
