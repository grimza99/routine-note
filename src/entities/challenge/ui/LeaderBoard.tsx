import { Rank } from './Rank';

export function LeaderBoard() {
  return (
    <div className="flex flex-col gap-4">
      <Rank imageUrl="" nickname="닉네임 테스트" experience="2000" rank={1} streakDays={20} />
      <Rank imageUrl="" nickname="닉네임 테스트" experience="2000" rank={1} streakDays={20} />
      <Rank imageUrl="" nickname="닉네임 테스트" experience="2000" rank={1} streakDays={20} />
    </div>
  );
}
