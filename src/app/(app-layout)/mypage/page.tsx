import MyPageProfile from '@/features/auth/ui/MyPageProfile';

export default function MyPage() {
  return (
    <div>
      <MyPageProfile nickname="닉네임 테스트" imageUrl="jkj" workoutDays={20} />
    </div>
  );
}
