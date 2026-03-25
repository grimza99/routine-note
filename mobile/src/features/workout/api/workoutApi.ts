import { API, IMonthlyReport, IWorkoutBydateResponse, IWorkoutPayload } from '@routine-note/package-shared';
import { apiClient } from '../../../shared/libs/network';

const toDate = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const date = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

const parseExercises = (input: string) =>
  input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((exerciseName, index) => ({
      exerciseName,
      order: index + 1,
      note: '',
    }));

export const workoutApi = {
  toDate,
  parseExercises,

  async getByDate(date: string) {
    const response = await apiClient.request<IWorkoutBydateResponse>(API.WORKOUT.BY_DATE(date));

    if (response.error) {
      throw new Error(response.error.message);
    }

    const data = response.data;
    if (!data || !data.id) {
      return null;
    }

    return data;
  },
  async getMonthlyReports(date: string) {
    const month = date.slice(0, 7); // "YYYY-MM"
    const response = await apiClient.request<IMonthlyReport>(API.WORKOUT.REPORT(month));

    if (response.error) {
      throw new Error(response.error.message);
    }

    const data = response.data;
    if (!data) {
      return null;
    }

    return data;
  },

  async create(payload: IWorkoutPayload) {
    const response = await apiClient.request<IWorkoutBydateResponse>(API.WORKOUT.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  async update(workoutId: string, payload: IWorkoutPayload) {
    const response = await apiClient.request<IWorkoutBydateResponse>(API.WORKOUT.UPDATE(workoutId), {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  async delete(workoutId: string) {
    const response = await apiClient.request<{ ok: boolean }>(API.WORKOUT.DELETE(workoutId), {
      method: 'DELETE',
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
  async deleteWorkoutRoutine(workoutRoutineId: string) {
    const response = await apiClient.request<{ ok: boolean }>(API.WORKOUT.DELETE_ROUTINE(workoutRoutineId), {
      method: 'DELETE',
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
};
