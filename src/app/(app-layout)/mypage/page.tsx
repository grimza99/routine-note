'use client';
import AccountInfoSection from '@/features/auth/ui/AccountInfoSection';
import MyPageProfile from '@/features/auth/ui/MyPageProfile';
import { SummaryCard } from '@/shared';

export default function MyPage() {
  const summaryData = [
    {
      title: '총 루틴',
      iconSrc: '/icons/goal.svg',
      value: 2 + '개',
    },
    {
      title: '이번달 운동 일수',
      iconSrc: '/icons/flame.svg',
      value: 0 + '일',
    },
    {
      title: '챌린지',
      iconSrc: '/icons/goal.svg',
      value: 0 + '등',
    },
  ];
  return (
    <div className="flex flex-col gap-8">
      <MyPageProfile nickname="닉네임 테스트" imageUrl="jkj" workoutDays={20} />
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
      <AccountInfoSection email="gbtmxlf@namver.com" nickname="닉네임" onSaveNickname={() => {}} />
    </div>
  );
}
