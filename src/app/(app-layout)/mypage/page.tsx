'use client';
import { FireIcon, BookmarkIcon, StarIcon } from '@heroicons/react/24/solid';

import { useAuthStore, useMyChallengeRank, useRoutineList, useWorkoutQuery } from '@/entities';
import { AccountInfoSection, MyPageProfile, ResetPasswordRequestButton, useMyInfoMutation } from '@/features/auth';
import { WithdrawRepuestButton } from '@/features/auth/ui/WithdrawRepuestButton';
import { SummaryCard } from '@/shared/ui';

export default function MyPage() {
  const { nickname, profile_image, email } = useAuthStore();
  const { data: routineListData } = useRoutineList();
  const { data: challengeData } = useMyChallengeRank(new Date().toISOString().slice(0, 7));
  const { data: goalArchivement } = useWorkoutQuery(new Date().toISOString().slice(0, 7));

  const { mutateAsync: updateMyInfo } = useMyInfoMutation();

  const summaryData = [
    {
      title: '총 루틴',
      icon: <BookmarkIcon className="size-7 md:size-9 text-primary" />,
      value: routineListData?.length + '개',
    },
    {
      title: '이번달 운동 일수',
      icon: <FireIcon className="size-7 md:size-9 text-primary" />,
      value: challengeData?.workoutDays + '일',
    },
    {
      title: '챌린지',
      icon: <StarIcon className="size-7 md:size-9 text-primary" />,
      value: challengeData?.rank ? challengeData?.rank + '등' : '참가전',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <MyPageProfile nickname={nickname} imageUrl={profile_image} workoutDays={challengeData?.workoutDays} />
      <section className="flex flex-wrap gap-4">
        {summaryData.map((data) => (
          <SummaryCard
            key={data.title}
            title={data.title}
            icon={data.icon}
            value={data.value}
            variant="secondary"
            className="flex-1 border-primary"
          />
        ))}
      </section>
      <AccountInfoSection
        email={email}
        nickname={nickname}
        goalWorkoutDays={goalArchivement?.goalWorkoutDays}
        onSaveInfo={updateMyInfo}
      />
      <div className="flex gap-4">
        <ResetPasswordRequestButton />
        <WithdrawRepuestButton />
      </div>
    </div>
  );
}
