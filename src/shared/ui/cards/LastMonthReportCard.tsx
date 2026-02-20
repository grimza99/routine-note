import { cn } from '../../libs/cn';

type LastMonthReportItem = {
  label: string;
  value: string;
};

type LastMonthReportCardProps = {
  monthLabel: string;
  achievementRate: number | null;
  items: LastMonthReportItem[];
  className?: string;
  achievementLabel?: string;
};

export function LastMonthReportCard({
  monthLabel,
  achievementRate,
  items,
  className,
  achievementLabel = '달성률',
}: LastMonthReportCardProps) {
  const archievementRateValue = achievementRate ? achievementRate + '%' : '설정 목표 없음';
  return (
    <div
      className={cn(
        'w-full rounded-2xl border-2 border-border bg-white p-4 md:p-6 hover:border-primary',
        'shadow-[0_1px_2px_rgba(0,0,0,0.08)]',
        className,
      )}
    >
      <header className="flex items-start justify-between">
        <h3 className="text-xl md:text-2xl font-bold text-text-primary">{monthLabel}</h3>
        <div className="flex flex-col items-end">
          <span className="text-xl md:text-2xl font-bold text-primary">{archievementRateValue}</span>
          <span className="text-sm font-bold text-text-secondary">{achievementLabel}</span>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={`${item.label}-${item.value}`}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-xl border border-transparent',
              'bg-surface px-6 py-5',
            )}
          >
            <span className="text-2xl font-bold text-primary">{item.value}</span>
            <span className="text-sm font-bold text-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
