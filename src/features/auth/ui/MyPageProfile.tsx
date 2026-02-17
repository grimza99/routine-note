import { DefaultProfile, Button, BouncingDots } from '@/shared';
import { useProfileImageMutation } from '@/features/auth';
import { ChangeEvent, useRef } from 'react';

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
    <section className="flex flex-col lg:flex-row items-center border-2 border-secondary rounded-lg p-2 md:p-6 gap-3">
      {imageUrl ? (
        <img
          src={imageUrl || '/icons/user.default.svg'}
          className="w-20 h-20 rounded-full border-2 border-primary object-cover object-center"
        />
      ) : (
        <DefaultProfile size={20} />
      )}

      <div className="flex flex-col items-center lg:items-start space-y-2">
        <span className="text-2xl font-bold">{nickname}</span>
        <span className="text-text-secondary">이번달 {workoutDays || 0}일째 운동 중🔥</span>
        <Button
          label={isPending ? <BouncingDots /> : '프로필 이미지 변경'}
          onClick={handleSelectFile}
          className="w-fit"
        />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    </section>
  );
}
