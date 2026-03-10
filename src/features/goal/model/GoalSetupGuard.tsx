'use client';
import { useEffect, useRef } from 'react';
import { useModal } from '@/shared/hooks';
import { useCurrentMonthGoal } from './goal.quey';
import { useAuthStoreActions } from '@/entities';

export default function GoalSetupGuard() {
  const { data: currentGoalData } = useCurrentMonthGoal();
  const { setGoalWorkoutDays } = useAuthStoreActions();
  const { openModal } = useModal();
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (!currentGoalData) {
      return;
    }
    if (currentGoalData) {
      if (!!currentGoalData.goalWorkoutDays || hasOpenedRef.current) {
        setGoalWorkoutDays(currentGoalData.goalWorkoutDays);
        return;
      }
      if (currentGoalData.hidden_setup_prompt) {
        return;
      }
    }

    openModal('monthlyGoalSetup');
    hasOpenedRef.current = true;
  }, [openModal, currentGoalData]);
  return null;
}
