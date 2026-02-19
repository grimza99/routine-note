import { API, QUERY_KEYS } from '@/shared/constants';
import { api } from '@/shared/libs/api';
import { useQuery } from '@tanstack/react-query';

interface IMyChallengeRankResponse {
  year_month: '2026-02';
  rank: number;
  workoutDays: number;
  totalParticipants: number;
}
//-----------------------------------------------해당 달 내 챌린지 랭킹 쿼리---------------------------------------------//

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

//-----------------------------------------------해당 달 모든 유저의 챌린지 랭킹---------------------------------------------//

interface IChallengeRankItem {
  imageUrl: string | null;
  rank: number;
  nickname: string;
  workoutDays: number;
}

export function useChallengeRankList(month: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CHALLENGE.MONTHLY_RANK],
    queryFn: async () => {
      try {
        const res = await api.get<IChallengeRankItem[]>(API.CHALLENGE.MONTHLY_RANK(month));

        return res.data;
      } catch (error) {
        //todo 에러 처리
        console.log('모든 랭킹 조회 실패:', error);
        throw error;
      }
    },
  });
}
