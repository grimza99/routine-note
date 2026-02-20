'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { MonthReport, PrevMonthsReports } from '@/entities';
import { useMonth } from '@/shared/hooks';
import { Tabs } from '@/shared/ui';
import { formatDateYearMonth } from '@/shared/libs';

const tabItems = [
  { id: 'current', label: '이번 달 리포트' },
  { id: 'prev', label: '지난 리포트' },
];

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<'prev' | 'current'>('current');
  const [month, setMonth] = useState<Date | null>(null);
  const { currentMonth, monthLabel, handlePrevMonth, handleNextMonth } = useMonth(month);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const tab = searchParams.get('tab');
    setActiveTab(tab === 'prev' ? 'prev' : 'current');
    const reportMonth = searchParams.get('report-month');
    if (reportMonth && tab === 'current') {
      setMonth(new Date(reportMonth));
    }
  }, [searchParams]);

  const handleChangeTab = (id: string) => {
    const nextTab = id === 'prev' ? 'prev' : 'current';
    setActiveTab(nextTab);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('tab', nextTab);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  const handleChageMonth = (direction: 'prev' | 'next', isNextMonthBlock?: boolean) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    let targetMonth = currentMonth;

    if (direction === 'prev') {
      handlePrevMonth();
      targetMonth = new Date(currentMonth);
      targetMonth.setMonth(targetMonth.getMonth() - 1);
    }
    if (direction === 'next') {
      handleNextMonth(isNextMonthBlock);
      targetMonth = new Date(currentMonth);
      targetMonth.setMonth(targetMonth.getMonth() + 1);
    }
    nextParams.set('report-month', formatDateYearMonth(targetMonth));
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };
  return (
    <div className="flex flex-col gap-5 md:gap-10">
      <Tabs items={tabItems} activeId={activeTab} onChange={handleChangeTab} className="border-2" />
      {activeTab === 'current' ? (
        <>
          <div className="flex items-center gap-4 border-2 border-border justify-center py-2 rounded-lg bg-white">
            <button type="button" onClick={() => handleChageMonth('prev')} aria-label="이전 달">
              <img src="/icons/craft.left.svg" alt="이전 달" className="w-6 h-6 md:w-9 md:h-9" />
            </button>
            <span className="font-semibold text-xl md:text-3xl text-primary">{monthLabel}</span>
            <button type="button" onClick={() => handleChageMonth('next', true)} aria-label="다음 달">
              <img src="/icons/craft.right.svg" alt="다음 달" className="w-6 h-6 md:w-9 md:h-9" />
            </button>
          </div>
          <MonthReport intialMonth={currentMonth} />
        </>
      ) : (
        <div className="flex flex-col gap-8 lg:gap-15 items-center">
          <h2 className="text-2xl italic md:text-3xl font-bold">지난 리포트</h2>
          <PrevMonthsReports />
        </div>
      )}
    </div>
  );
}
