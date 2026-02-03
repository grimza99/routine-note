import { API, QUERY_KEYS } from '@/shared';
import { api } from '@/shared/libs/api';
import { useQuery } from '@tanstack/react-query';

export type MonthlyTrendSeries = {
  id: string;
  data: { x: string; y: number | null }[];
};

export type RoutineDistributionItem = {
  id: string;
  label: string;
  value: number;
};

export type WeeklyVolumeItem = {
  day: string;
  volume: number;
};

export function useMonthlyTrendQuery() {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORT.MONTHLY_TRENDS],
    queryFn: async () => {
      try {
        const res = await api.get<MonthlyTrendSeries[]>(API.REPORT.MONTHLY_TRENDS);
        return res.data ?? [];
      } catch (error) {
        console.log('월간 성과 추이 조회 실패:', error);
        throw error;
      }
    },
  });
}

export function useRoutineDistributionQuery(month: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORT.ROUTINE_DISTRIBUTION, month],
    queryFn: async () => {
      try {
        const res = await api.get<RoutineDistributionItem[]>(API.REPORT.ROUTINE_DISTRIBUTION(month));
        return res.data ?? [];
      } catch (error) {
        console.log('루틴 분포 조회 실패:', error);
        throw error;
      }
    },
    enabled: Boolean(month),
  });
}

export function useWeeklyVolumeQuery(month: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.REPORT.WEEKLY_VOLUME, month],
    queryFn: async () => {
      try {
        const res = await api.get<WeeklyVolumeItem[]>(API.REPORT.WEEKLY_VOLUME(month));
        return res.data ?? [];
      } catch (error) {
        console.log('주간 운동량 조회 실패:', error);
        throw error;
      }
    },
    enabled: Boolean(month),
  });
}
