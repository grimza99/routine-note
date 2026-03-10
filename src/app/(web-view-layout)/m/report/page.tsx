'use client';
import { Suspense, useEffect, useState } from 'react';
import { useMonth } from '@routine-note/package-shared';

import { MonthReport, PrevMonthsReports } from '@/entities';
import { Tabs } from '@/shared/ui';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { tabItems } from '@/entities/report/model/tabItem';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { formatDateYearMonth } from '@/shared/libs';

export default function MobileReportPage() {
  return (
    <Suspense fallback={null}>
      <MobileReportContent />
    </Suspense>
  );
}
function MobileReportContent() {
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
    <div className="flex flex-col gap-5 md:gap-20">
      <div>
        <Tabs items={tabItems} activeId={activeTab} onChange={handleChangeTab} />
        {activeTab === 'current' && (
          <div className="flex items-center gap-4 border-2 border-border justify-center py-2 rounded-lg mt-5">
            <ChevronLeftIcon
              className="size-6 text-primary"
              onClick={() => handleChageMonth('prev')}
              aria-label="이전 달"
            />
            <span className="font-semibold text-xl md:text-3xl text-primary">{monthLabel}</span>
            <ChevronRightIcon
              className="size-6 text-primary"
              onClick={() => handleChageMonth('next', true)}
              aria-label="다음 달"
            />
          </div>
        )}
      </div>
      {activeTab === 'current' ? (
        <MonthReport intialMonth={currentMonth} />
      ) : (
        <div className="flex flex-col gap-8 lg:gap-15 items-center">
          <h2 className="text-xl md:text-3xl font-bold">지난 리포트</h2>
          <PrevMonthsReports />
        </div>
      )}
    </div>
  );
}
