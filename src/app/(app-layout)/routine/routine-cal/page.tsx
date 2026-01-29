'use client';
import { useWorkoutQuery } from '@/entities/workout/model/workout.query';
import { SummaryCard } from '@/shared';
import { useState } from 'react';

//todo monthlyReportData.goalWorkoutDays 가 null일때 모달로 월 목표 설정 유도
export default function RoutineCalPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const { data: monthlyReportData } = useWorkoutQuery('2026-01');

  const summaryData = [
    {
      title: '연속 일수',
      iconSrc: '/icons/flame.svg',
      value: (monthlyReportData?.maxConsecutiveWorkoutDays || 0) + '일',
    },
    {
      title: '이번 달 루틴 수행 횟수',
      iconSrc: '/icons/goal.svg',
      value: (monthlyReportData?.workoutDays || 0) + '회',
    },
    {
      title: '월 목표 달성률',
      iconSrc: '/icons/graph.svg',
      value: (monthlyReportData?.goalAchievementRate || 0) + '%',
    },
  ];
  return (
    <div className="flex flex-col gap-8 items-center w-full">
      <div className="flex flex-col md:flex-row gap-4 w-full">
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
