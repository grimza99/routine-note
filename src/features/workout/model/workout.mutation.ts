import { ANALYTICS_EVENTS, API, QUERY_KEYS, TOAST_MESSAGE } from '@/shared/constants';
import { useToast } from '@/shared/hooks';
import { trackEvent } from '@/shared/libs';
import { api } from '@/shared/libs/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface IWorkoutPayload {
  date: string; // YYYY-MM-DD
  routines: { routineId: string; note?: '' }[];
  exercises: { exerciseName: string; note?: '' }[];
}

//-----------------------------------------------workout 생성---------------------------------------------//

export const useCreateWorkoutMutation = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  return useMutation({
    mutationFn: async (payload: IWorkoutPayload) => {
      try {
        const res = await api.post(API.WORKOUT.CREATE, { ...payload });

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      void trackEvent({
        eventName: ANALYTICS_EVENTS.WORKOUT_CREATED,
        source: 'web-workout-create',
        properties: {
          date: variables.date,
          routineCount: variables.routines.length,
          exerciseCount: variables.exercises.length,
        },
      });
      if (variables.routines.length > 0) {
        void trackEvent({
          eventName: ANALYTICS_EVENTS.ROUTINE_APPLIED,
          source: 'web-workout-create',
          properties: { date: variables.date, routineCount: variables.routines.length },
        });
      }
      showToast({ message: TOAST_MESSAGE.SUCCESS_CREATE_WORKOUT });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_BY_DATE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_REPORT] });
    },
    onError: (error) => {
      showToast({ message: error.message, variant: 'error' });
    },
  });
};

//-----------------------------------------------workout 수정---------------------------------------------//
export const useUpdateWorkoutMutation = (workoutId: string | undefined) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async (payload: IWorkoutPayload) => {
      if (!workoutId) {
        throw new Error('Invalid workout ID');
      }
      try {
        const res = await api.put(API.WORKOUT.UPDATE(workoutId), payload);

        if (res.error) {
          throw res.error;
        }

        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (_data, variables) => {
      void trackEvent({
        eventName: ANALYTICS_EVENTS.WORKOUT_UPDATED,
        source: 'web-workout-update',
        properties: {
          date: variables.date,
          routineCount: variables.routines.length,
          exerciseCount: variables.exercises.length,
        },
      });
      if (variables.routines.length > 0) {
        void trackEvent({
          eventName: ANALYTICS_EVENTS.ROUTINE_APPLIED,
          source: 'web-workout-update',
          properties: { date: variables.date, routineCount: variables.routines.length },
        });
      }
      showToast({ message: TOAST_MESSAGE.SUCCESS_UPDATE_WORKOUT });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_BY_DATE] });
    },
    onError: (error) => {
      showToast({ message: error.message, variant: 'error' });
    },
  });
};

//-----------------------------------------------workout 삭제---------------------------------------------//
export const useDeleteWorkoutMutation = (workoutId: string | undefined) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!workoutId) {
        throw new Error('Invalid workout ID');
      }
      try {
        const res = await api.delete(API.WORKOUT.DELETE(workoutId));

        if (res.error) {
          throw res.error;
        }
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      showToast({ message: TOAST_MESSAGE.SUCCESS_DELETE_WORKOUT });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_BY_DATE] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKOUT_REPORT] });
    },
    onError: (error) => {
      showToast({ message: error.message, variant: 'error' });
    },
  });
};
