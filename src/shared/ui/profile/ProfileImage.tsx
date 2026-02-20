import { cn } from '@/shared/libs/cn';

interface ProfileImageProps {
  profileImageUrl?: string | null;
  className?: string;
}
export function ProfileImage({ profileImageUrl, className }: ProfileImageProps) {
  return (
    <img
      src={profileImageUrl || '/icons/user.default.svg'}
      className={cn(
        'overflow-hidden object-coverw w-20 h-20 rounded-full border-2 border-primary object-cover object-center',
        className,
      )}
      alt="user-profile-image"
    />
  );
}
