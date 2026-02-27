'use client';
import { useEffect, useRef } from 'react';
import { useModal } from '@/shared/hooks';
import { useCurrentMonthGoal } from './goal.quey';
import { useAuthStore, useAuthStoreActions } from '@/entities';

export default function GoalSetupGuard() {
  const { data: currentGoalData } = useCurrentMonthGoal();
  const { hidden_goal_setup_prompt } = useAuthStore();
  const { setGoalWorkoutDays } = useAuthStoreActions();
  const { openModal } = useModal();
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (!currentGoalData || hidden_goal_setup_prompt) {
      return;
    }

    if (currentGoalData) {
      const { goalWorkoutDays } = currentGoalData;
      setGoalWorkoutDays(goalWorkoutDays);
      if (!!goalWorkoutDays || hasOpenedRef.current) {
        return;
      }
    }

    openModal('monthlyGoalSetup');
    hasOpenedRef.current = true;
  }, [openModal, currentGoalData]);
  return null;
}
