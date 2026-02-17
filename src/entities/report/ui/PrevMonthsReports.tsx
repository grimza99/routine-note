import { LastMonthReportCard, Spinner } from '@/shared';
import { useAllMonthReportsQuery } from '../model/report.query';

export function PrevMonthsReports() {
  const { data: prevReportsData } = useAllMonthReportsQuery();
  if (!prevReportsData) {
    return <Spinner />;
  }
  return (
    <section className="w-full flex flex-col gap-4 md:gap-6">
      {prevReportsData.length > 0 ? (
        prevReportsData.map((report) => (
          <LastMonthReportCard
            key={report.month}
            monthLabel={report.month}
            achievementRate={report.goalAchievementRate || 0}
            items={[
              { label: '운동한 날', value: `${report.workoutDays}일` },
              { label: '총 운동 세트', value: `${report.totalSets}세트` },
              { label: '최대 연속 운동', value: `${report.maxConsecutiveWorkoutDays}일` },
            ]}
          />
        ))
      ) : (
        <p className="text-sm md:text-base text-text-secondary w-full text-center min-h-60">지난 리포트가 없습니다.</p>
      )}
    </section>
  );
}
