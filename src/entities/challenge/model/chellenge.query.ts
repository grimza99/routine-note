import { API, QUERY_KEYS } from '@/shared';
import { api } from '@/shared/libs/api';
import { useQuery } from '@tanstack/react-query';

interface IMyChallengeRankResponse {
  year_month: '2026-02';
  rank: number;
  workoutDays: number;
  totalParticipants: number;
}
//해당 달 유저의 챌린지 정보 쿼리
export function useMyChallengeRank(month: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHALLENGE.MY_RANK],
    queryFn: async () => {
      try {
        const res = await api.get<IMyChallengeRankResponse>(API.CHALLENGE.MY_RANK(month));

        return res.data;
      } catch (error) {
        //todo 에러 처리
        console.log('내 랭킹 조회 실패:', error);
        throw error;
      }
    },
  });
}
