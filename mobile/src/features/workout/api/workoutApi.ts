import { apiClient } from '../../../shared/libs/network';
import type { WorkoutBydateResponse, WorkoutPayload, WorkoutSetPayload } from '../../../shared/types/workout';

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
    const response = await apiClient.request<WorkoutBydateResponse>(`/api/workouts?date=${date}`);

    if (response.error) {
      throw new Error(response.error.message);
    }

    const data = response.data;
    if (!data || !data.id) {
      return null;
    }

    return data;
  },

  async create(payload: WorkoutPayload) {
    const response = await apiClient.request<WorkoutBydateResponse>('/api/workouts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  async update(workoutId: string, payload: WorkoutPayload) {
    const response = await apiClient.request<WorkoutBydateResponse>(`/api/workouts/${workoutId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  async remove(workoutId: string) {
    const response = await apiClient.request<{ ok: boolean }>(`/api/workouts/${workoutId}`, {
      method: 'DELETE',
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  async createSet(workoutExerciseId: string | undefined, payload: WorkoutSetPayload) {
    if (!workoutExerciseId) {
      throw new Error('workoutExerciseId is required to create a set');
    }
    const response = await apiClient.request<{ id: string; weight: number | null; reps: number | null }>(
      `/api/workout-exercises/${workoutExerciseId}/sets`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
  async updateSet(setId: string, payload: WorkoutSetPayload) {
    const response = await apiClient.request<{ id: string; weight: number | null; reps: number | null }>(
      `/api/sets/${setId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
  async deleteSet(setId: string) {
    const response = await apiClient.request<{ ok: boolean }>(`/api/sets/${setId}`, {
      method: 'DELETE',
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
  async createWorkoutRoutineNote(workoutRoutineId: string, note: string) {
    const response = await apiClient.request<{ id: string; note: string }>(
      `/api/workout-routines/${workoutRoutineId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ note }),
      },
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
};
