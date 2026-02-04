import { cn } from '@/shared/libs/cn';

export function DefaultProfile({ size = 10 }: { size?: number }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-full border-2 border-primary bg-white',
        `w-${size} h-${size}`,
      )}
    >
      <img
        src="/icons/user.default.svg"
        className={cn('overflow-hidden object-cover', `w-${size} h-${size}`)}
        alt="default-user-image"
      />
    </div>
  );
}
