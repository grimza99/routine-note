import { Button, BouncingDots } from '@/shared';
import { useProfileImageMutation } from '@/features/auth';
import { ChangeEvent, useRef } from 'react';
import { ProfileImage } from '@/shared/ui';
import { PencilIcon } from '@heroicons/react/24/solid';

interface MyPageProfileProps {
  imageUrl: string | null;
  nickname: string;
  workoutDays?: number;
}
export default function MyPageProfile({ imageUrl, nickname, workoutDays }: MyPageProfileProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutateAsync: uploadProfileImage, isPending } = useProfileImageMutation();

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadProfileImage(file);
    event.target.value = '';
  };

  return (
    <section className="flex flex-col md:flex-row items-center border-2 border-primary rounded-lg p-2 md:p-6 gap-3 md:gap-8">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <div className="relative">
        <ProfileImage profileImageUrl={imageUrl} />
        <Button
          label={isPending ? <BouncingDots /> : <PencilIcon className="size-4 text-white" />}
          onClick={handleSelectFile}
          className="w-fit rounded-full h-fit p-2 absolute top-0 -right-2"
        />
      </div>
      <div className="flex flex-col items-center md:items-start space-y-2">
        <span className="text-2xl font-bold">{nickname}</span>
        <span className="text-lgtext-text-secondary">이번달 {workoutDays || 0}일째 운동 중 🔥</span>
      </div>
    </section>
  );
}
