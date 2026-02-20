import { Spinner } from '@/shared/ui';
import { useChallengeRankList } from '../model/chellenge.query';
import { Rank } from './Rank';

export function LeaderBoard() {
  const { data: rankListData } = useChallengeRankList(new Date().toISOString().slice(0, 7));

  if (!rankListData) {
    return <Spinner />;
  }
  return (
    <div className="flex flex-col gap-2 md:gap-4 mt-5 md:mt-10">
      <div className="border-2 border-border rounded-lg p-4 flex flex-col gap-4 items-center">
        {rankListData.length === 0 ? (
          <span className="text-text-secondary">아직 챌린지에 참여한 유저가 없어요!</span>
        ) : (
          <>
            {rankListData.map((rank) => (
              <Rank
                key={rank.nickname}
                imageUrl={rank.imageUrl || ''}
                nickname={rank.nickname}
                rank={rank.rank}
                workoutDays={rank.workoutDays}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
