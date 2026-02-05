import { Spinner } from '@/shared';
import { useChallengeRankList } from '../model/chellenge.query';
import { Rank } from './Rank';

export function LeaderBoard() {
  const { data: rankListData } = useChallengeRankList(new Date().toISOString().slice(0, 7));

  if (!rankListData) {
    return <Spinner />;
  }
  return (
    <div className="flex flex-col gap-4">
      {rankListData.map((rank) => (
        <Rank
          key={rank.nickname}
          imageUrl={rank.imageUrl || ''}
          nickname={rank.nickname}
          rank={rank.rank}
          workoutDays={rank.workoutDays}
        />
      ))}
    </div>
  );
}
