'use client';
import { useState } from 'react';

import { useWorkoutQuery } from '@/entities';
import { SummaryCard } from '@/shared/ui';
import { Calendar } from '@/widgets';
import { WorkoutManage } from '@/features/workout';

//todo monthlyData.goalWorkoutDays 가 null일때 모달로 월 목표 설정 유도
export default function WorkoutCalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: monthlyData } = useWorkoutQuery(currentMonth);

  const summaryData = [
    {
      title: '최대 연속 일수',
      iconSrc: '/icons/flame.svg',
      value: (monthlyData?.maxConsecutiveWorkoutDays || 0) + '일',
    },
    {
      title: '운동 횟수',
      iconSrc: '/icons/goal.svg',
      value: (monthlyData?.workoutDays || 0) + '회',
    },
    {
      title: '월 목표 달성률',
      iconSrc: '/icons/graph.svg',
      value: (monthlyData?.goalAchievementRate || 0) + '%',
    },
  ];

  return (
    <div className="flex flex-col gap-8 items-center w-full">
      <div className="w-full">
        <span className="text-text-secondary mb-3 ml-2">{currentMonth} 기준</span>
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
      <Calendar value={selectedDate} onSelectDate={setSelectedDate} recordDates={monthlyData?.workoutDates} />
      <WorkoutManage selectedDate={selectedDate} />
    </div>
  );
}
