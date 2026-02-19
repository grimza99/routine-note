import { cn } from '@/shared';

type TabItem = {
  id: string;
  label: string;
  disabled?: boolean;
};

type TabsProps = {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

export function Tabs({ items, activeId, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex w-full gap-2 rounded-lg border p-1 border-border bg-white', className)}>
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              'flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
              item.disabled && 'opacity-50',
            )}
            style={{
              background: isActive ? 'var(--primary)' : 'var(--white)',
              color: isActive ? 'var(--white)' : 'var(--text-secondary)',
            }}
            onClick={() => onChange(item.id)}
            disabled={item.disabled}
            aria-pressed={isActive}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
