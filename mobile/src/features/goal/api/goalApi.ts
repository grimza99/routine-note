import { apiClient } from '../../../shared/libs/network';

export const goalApi = {
  async getGoal() {
    const response = await apiClient.request<{ month: string; goalWorkoutDays: number; hidden_setup_prompt: boolean }>(
      `/api/account/goal`,
      {
        method: 'GET',
      },
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
  async updateGoal(goalWorkoutDays: number) {
    const response = await apiClient.request<{ date: string; goalWorkoutDays: number; hidden_goal_setup: boolean }>(
      `/api/account/goal`,
      {
        method: 'PATCH',
        body: JSON.stringify({ goalWorkoutDays }),
      },
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
  async hiddenGoalSetupPrompt() {
    const response = await apiClient.request<{ date: string; goalWorkoutDays: number; hidden_goal_setup: boolean }>(
      `/api/account/goal`,
      {
        method: 'POST',
      },
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
};
