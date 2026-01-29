import { LastMonthReportCard } from '@/shared';

export default function Home() {
  return (
    <div className="">
      <LastMonthReportCard
        monthLabel="2024년 10월"
        achievementRate="82%"
        items={[
          { value: '28', label: '완료 일수' },
          { value: '15', label: '최대 연속' },
          { value: 'A+', label: '등급' },
        ]}
      />
    </div>
  );
}
