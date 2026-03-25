import { API } from '@routine-note/package-shared';
import { apiClient } from '../../../shared/libs/network';

export const workoutNoteApi = {
  async create(workoutRoutineId: string, note: string) {
    const response = await apiClient.request<{ note: string }>(API.WORKOUT.NOTE.ROUTINE(workoutRoutineId), {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
};
