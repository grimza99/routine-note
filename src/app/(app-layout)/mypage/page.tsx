'use client';
import { useMyChallengeRank, useRoutineList, useWorkoutQuery } from '@/entities';
import useAuthStore from '@/entities/auth/model/useAuthStore';
import { useMyInfoMutation } from '@/features/auth';
import AccountInfoSection from '@/features/auth/ui/AccountInfoSection';
import MyPageProfile from '@/features/auth/ui/MyPageProfile';
import { SummaryCard } from '@/shared';

export default function MyPage() {
  const { nickname, profile_image, email } = useAuthStore();

  const { data: routineListData } = useRoutineList();
  const { data: challengeData } = useMyChallengeRank(new Date().toISOString().slice(0, 7));
  const { data: goalArchivement } = useWorkoutQuery(new Date().toISOString().slice(0, 7));

  const { mutateAsync: updateMyInfo } = useMyInfoMutation();

  const summaryData = [
    {
      title: '총 루틴',
      iconSrc: '/icons/goal.svg',
      value: routineListData?.length + '개',
    },
    {
      title: '이번달 운동 일수',
      iconSrc: '/icons/flame.svg',
      value: challengeData?.workoutDays + '일',
    },
    {
      title: '챌린지',
      iconSrc: '/icons/goal.svg',
      value: challengeData?.rank + '등',
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
            iconSrc={data.iconSrc}
            value={data.value}
            variant="secondary"
            className="flex-1"
          />
        ))}
      </section>
      <AccountInfoSection
        email={email}
        nickname={nickname}
        goalWorkoutDays={goalArchivement?.goalWorkoutDays}
        onSaveInfo={updateMyInfo}
      />
    </div>
  );
}
