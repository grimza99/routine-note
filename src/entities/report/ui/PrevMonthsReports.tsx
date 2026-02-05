import { LastMonthReportCard } from '@/shared';

const items = [
  { label: '운동한 날', value: '0일' },
  { label: '총 운동 세트', value: '0세트' },
  { label: '총 운동 시간', value: '0시간' },
];
export function PrevMonthsReports() {
  return (
    <div className="flex flex-col gap-8 lg:gap-15 items-center">
      <h2 className="text-3xl font-bold">지난 리포트</h2>
      <section className="w-full flex flex-col gap-4 md:gap-6">
        <LastMonthReportCard monthLabel="라벨" achievementRate={'0%'} items={items} />{' '}
        <LastMonthReportCard monthLabel="라벨" achievementRate={'0%'} items={items} />
        <LastMonthReportCard monthLabel="라벨" achievementRate={'0%'} items={items} />
      </section>
    </div>
  );
}
