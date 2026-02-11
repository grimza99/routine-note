'use client';

import { MonthReport, PrevMonthsReports } from '@/entities';
import { Tabs } from '@/shared';
import { useState } from 'react';

const tabItems = [
  { id: 'current', label: '이번 달 리포트' },
  { id: 'prev', label: '지난 리포트' },
];

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<'prev' | 'current'>('current');

  return (
    <div className="flex flex-col gap-20">
      <Tabs items={tabItems} activeId={activeTab} onChange={(id) => setActiveTab(id as 'prev' | 'current')} />
      {activeTab === 'current' ? (
        <MonthReport />
      ) : (
        <div className="flex flex-col gap-8 lg:gap-15 items-center">
          <h2 className="text-3xl font-bold">지난 리포트</h2>
          <PrevMonthsReports />
        </div>
      )}
    </div>
  );
}
