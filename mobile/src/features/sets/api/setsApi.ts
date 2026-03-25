import { API, TSetPayload, TSetResponse } from '@routine-note/package-shared';
import { apiClient } from '../../../shared/libs/network';

export const setsApi = {
  async create(payload: TSetPayload) {
    const response = await apiClient.request<TSetResponse>(API.WORKOUT.SETS.CREATE(payload.id), {
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

  async update(payload: TSetPayload) {
    const response = await apiClient.request<TSetResponse>(API.WORKOUT.SETS.EDIT(payload.id), {
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
};
