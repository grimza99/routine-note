'use client';
import { useEffect, useMemo } from 'react';

import { MonthlyTrendLineChart, RoutineDistributionPieChart, WeeklyVolumeBarChart } from '@/features/report';
import { useMonthlyTrendQuery, useRoutineDistributionQuery, useWeeklyVolumeQuery } from '../model/report.query';
import { formatDateYearMonth, trackEvent } from '@/shared/libs';
import { ANALYTICS_EVENTS } from '@/shared/constants';
import { Spinner, SummaryCard } from '@/shared/ui';
import { useWorkoutQuery } from '@/entities/workout/model/workout.query';

export function MonthReport({ intialMonth }: { intialMonth?: Date }) {
  const currentMonth = formatDateYearMonth(intialMonth) || formatDateYearMonth(new Date());
  const { data: monthlyReportData } = useWorkoutQuery(currentMonth);
  const { data: routineDistribution = [], isLoading: isRoutineLoading } = useRoutineDistributionQuery(currentMonth);
  const { data: monthlyTrends = [], isLoading: isMonthlyTrendLoading } = useMonthlyTrendQuery(currentMonth);
  const availableMonths = useMemo(() => {
    const firstSeries = monthlyTrends[0]?.data ?? [];
    return firstSeries.map((point) => String(point.x));
  }, [monthlyTrends]);
  const selectedMonth = useMemo(
    () => (availableMonths.length ? availableMonths[availableMonths.length - 1] : ''),
    [availableMonths],
  );
  const { data: weeklyVolume = [], isLoading: isWeeklyLoading } = useWeeklyVolumeQuery(selectedMonth);

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
  useEffect(() => {
    if (!currentMonth) return;
    void trackEvent({
      eventName: ANALYTICS_EVENTS.REPORT_VIEWED,
      source: 'web-report-month',
      properties: {
        month: currentMonth,
      },
    });
  }, [currentMonth]);

  return (
    <>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
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
      {
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">주간 운동량</h2>
            <span className="text-sm text-text-secondary">세트수 × 무게 기준</span>
          </div>
          <div className="rounded-lg border-2 border-border p-8 text-sm md:text-base text-text-secondary bg-white">
            {isWeeklyLoading ? (
              <Spinner size={20} />
            ) : weeklyVolume.length ? (
              <WeeklyVolumeBarChart data={weeklyVolume} />
            ) : (
              <p className="text-center">이번 달의 주간 운동량 데이터가 없어요.</p>
            )}
          </div>
        </section>
      }
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">월간 목표 달성률 추이</h2>{' '}
        <div className="rounded-lg border-2 border-border p-8 text-sm md:text-base text-text-secondary bg-white">
          {isMonthlyTrendLoading ? (
            <Spinner size={20} />
          ) : monthlyReportData?.goalWorkoutDays === null ? (
            <p className="text-center">이번달에 설정한 목표운동 일수가 없어요.</p>
          ) : monthlyTrends.length ? (
            <MonthlyTrendLineChart data={monthlyTrends} />
          ) : (
            <p className="text-center">이번 달의 월간 데이터가 없어요.</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">루틴 분포</h2>
        <div className="rounded-lg border-2 border-border p-8 text-sm md:text-base text-text-secondary bg-white">
          {isRoutineLoading ? (
            <Spinner size={20} />
          ) : routineDistribution.length ? (
            <RoutineDistributionPieChart data={routineDistribution} />
          ) : (
            <p className="text-center">표시할 루틴 분포 데이터가 없어요.</p>
          )}
        </div>
      </section>
    </>
  );
}

const EmptyDataCard = ({ text }: { text: string }) => {
  return (
    <div className="rounded-lg border-2 border-border p-8 text-sm md:text-base text-text-secondary bg-white">
      {text}
    </div>
  );
};
