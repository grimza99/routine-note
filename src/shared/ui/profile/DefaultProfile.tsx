import { cn } from '@/shared/libs/cn';

export function DefaultProfile() {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-full border-2 border-primary bg-white w-8 h-8 md:w-10 md:h-10',
      )}
    >
      <img
        src="/icons/user.default.svg"
        className={cn('overflow-hidden object-cover', `w-8 h-8 md:w-10 md:h-10`)}
        alt="default-user-image"
      />
    </div>
  );
}
