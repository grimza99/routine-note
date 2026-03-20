import { API, IRoutine } from '@routine-note/package-shared';
import { apiClient } from '../../../shared/libs/network';
import type { RoutinePayload } from '../../../shared/types/routine';

export const routineApi = {
  async list() {
    const response = await apiClient.request<IRoutine[]>(API.ROUTINE.LIST);

    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data ?? [];
  },

  async create(payload: RoutinePayload) {
    const response = await apiClient.request<{ routineId: string; routineName: string }>(API.ROUTINE.CREATE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  async update(routineId: string, payload: RoutinePayload) {
    const response = await apiClient.request<{ routineId: string; routineName: string }>(API.ROUTINE.EDIT(routineId), {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },

  async remove(routineId: string) {
    const response = await apiClient.request<{ ok: boolean }>(API.ROUTINE.DELETE(routineId), {
      method: 'DELETE',
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
};
