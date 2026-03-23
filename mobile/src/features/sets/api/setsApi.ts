import { API, ICardioSet, IStrengthSet, IWorkoutBydateResponse, IWorkoutPayload } from '@routine-note/package-shared';
import { apiClient } from '../../../shared/libs/network';
import { IMonthlyReportResponse } from '../../../shared/types/report';

type ISetsPayload = ICardioSet | IStrengthSet;

export const setsApi = {
  async create(payload: ISetsPayload) {
    const response = await apiClient.request<IMonthlyReportResponse>(API.WORKOUT.SETS.CREATE(payload.id), {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    const data = response.data;
    if (!data) {
      return null;
    }

    return data;
  },

  async update(payload: ISetsPayload) {
    const response = await apiClient.request<IWorkoutBydateResponse>(API.WORKOUT.SETS.EDIT(payload.id), {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  async delete(setId: string) {
    const response = await apiClient.request<{ ok: boolean }>(API.WORKOUT.SETS.DELETE(setId), {
      method: 'DELETE',
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
  async createWorkoutRoutineNote(workoutRoutineId: string, note: string) {
    const response = await apiClient.request<{ id: string; note: string }>(API.WORKOUT.NOTE.ROUTINE(workoutRoutineId), {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
};
