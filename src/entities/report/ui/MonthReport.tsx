'use client';
import { useWorkoutQuery } from '@/entities/workout/model/workout.query';
import { MonthlyTrendLineChart, RoutineDistributionPieChart, WeeklyVolumeBarChart } from '@/features/report';
import { Spinner, SummaryCard } from '@/shared';
import { useEffect, useMemo, useState } from 'react';
import { useMonthlyTrendQuery, useRoutineDistributionQuery, useWeeklyVolumeQuery } from '../model/report.query';
import { formatDateYearMonth } from '@/shared/libs';

export function MonthReport({ intialMonth }: { intialMonth?: Date }) {
  const currentMonth = formatDateYearMonth(intialMonth) || formatDateYearMonth(new Date());

  const [selectedMonth, setSelectedMonth] = useState('');

  const { data: monthlyReportData } = useWorkoutQuery(currentMonth);
  const { data: weeklyVolume = [], isLoading: isWeeklyLoading } = useWeeklyVolumeQuery(selectedMonth);
  const { data: routineDistribution = [], isLoading: isRoutineLoading } = useRoutineDistributionQuery(currentMonth);
  const { data: monthlyTrends = [], isLoading: isMonthlyTrendLoading } = useMonthlyTrendQuery(currentMonth);

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
  const availableMonths = useMemo(() => {
    const firstSeries = monthlyTrends[0]?.data ?? [];
    return firstSeries.map((point) => String(point.x));
  }, [monthlyTrends]);

  useEffect(() => {
    if (!selectedMonth && availableMonths.length) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

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
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">주간 운동량</h2>
          <span className="text-sm text-text-secondary">세트수 × 무게 기준</span>
        </div>
        {isWeeklyLoading ? (
          <div
            className="flex items-center justify-center rounded-lg border p-8"
            style={{ borderColor: 'var(--border)' }}
          >
            <Spinner size={20} />
          </div>
        ) : weeklyVolume.length ? (
          <WeeklyVolumeBarChart data={weeklyVolume} />
        ) : (
          <div className="rounded-lg border p-8 text-sm text-text-secondary" style={{ borderColor: 'var(--border)' }}>
            표시할 주간 운동량 데이터가 없어요.
          </div>
        )}
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">월간 목표 달성률 추이</h2>
        {isMonthlyTrendLoading ? (
          <div
            className="flex items-center justify-center rounded-lg border p-8"
            style={{ borderColor: 'var(--border)' }}
          >
            <Spinner size={20} />
          </div>
        ) : monthlyTrends.length ? (
          <MonthlyTrendLineChart data={monthlyTrends} />
        ) : (
          <div className="rounded-lg border p-8 text-sm text-text-secondary" style={{ borderColor: 'var(--border)' }}>
            표시할 월간 데이터가 없어요.
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-text-primary">루틴 분포</h2>
        {isRoutineLoading ? (
          <div className="flex items-center justify-center rounded-lg border p-8 border-border">
            <Spinner size={20} />
          </div>
        ) : routineDistribution.length ? (
          <RoutineDistributionPieChart data={routineDistribution} />
        ) : (
          <div className="rounded-lg border p-8 text-sm text-text-secondary border-border">
            표시할 루틴 분포 데이터가 없어요.
          </div>
        )}
      </section>
    </>
  );
}
