import { apiClient } from '../../../shared/libs/network';
import type { RoutineItem, RoutinePayload } from '../../../shared/types/routine';

export const routineApi = {
  async list() {
    const response = await apiClient.request<RoutineItem[]>('/api/routines');

    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data ?? [];
  },

  async create(payload: RoutinePayload) {
    const response = await apiClient.request<{ routineId: string; routineName: string }>('/api/routines', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  async update(routineId: string, payload: RoutinePayload) {
    const response = await apiClient.request<{ routineId: string; routineName: string }>(`/api/routines/${routineId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  async remove(routineId: string) {
    const response = await apiClient.request<{ ok: boolean }>(`/api/routines/${routineId}`, {
      method: 'DELETE',
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
};
