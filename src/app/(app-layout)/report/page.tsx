'use client';

import { MonthReport, PrevMonthsReports } from '@/entities';
import { Tabs } from '@/shared';
import { useMonth } from '@/shared/hooks';
import { useState } from 'react';

const tabItems = [
  { id: 'current', label: '이번 달 리포트' },
  { id: 'prev', label: '지난 리포트' },
];

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<'prev' | 'current'>('current');
  const { currentMonth, monthLabel, handlePrevMonth, handleNextMonth } = useMonth();

  return (
    <div className="flex flex-col gap-15 md:gap-20">
      <div>
        <Tabs items={tabItems} activeId={activeTab} onChange={(id) => setActiveTab(id as 'prev' | 'current')} />
        {activeTab === 'current' && (
          <div className="flex items-center gap-4 border-2 border-border justify-center py-2 rounded-lg mt-5">
            <button type="button" onClick={handlePrevMonth} aria-label="이전 달">
              <img src="/icons/craft.left.svg" alt="이전 달" className="w-6 h-6 md:w-9 md:h-9" />
            </button>
            <span className="font-semibold text-xl md:text-3xl text-primary">{monthLabel}</span>
            <button type="button" onClick={handleNextMonth} aria-label="다음 달">
              <img src="/icons/craft.right.svg" alt="다음 달" className="w-6 h-6 md:w-9 md:h-9" />
            </button>
          </div>
        )}
      </div>
      {activeTab === 'current' ? (
        <MonthReport intialMonth={currentMonth} />
      ) : (
        <div className="flex flex-col gap-8 lg:gap-15 items-center">
          <h2 className="text-3xl font-bold">지난 리포트</h2>
          <PrevMonthsReports />
        </div>
      )}
    </div>
  );
}
