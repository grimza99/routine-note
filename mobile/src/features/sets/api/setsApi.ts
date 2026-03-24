import { API, ICardioSet, IStrengthSet } from '@routine-note/package-shared';
import { apiClient } from '../../../shared/libs/network';

type ISetsPayload = ICardioSet | IStrengthSet;

type ISetResponse = ICardioSet | IStrengthSet;
export const setsApi = {
  async create(payload: ISetsPayload) {
    const response = await apiClient.request<ISetResponse>(API.WORKOUT.SETS.CREATE(payload.id), {
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
    const response = await apiClient.request<ISetResponse>(API.WORKOUT.SETS.EDIT(payload.id), {
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
