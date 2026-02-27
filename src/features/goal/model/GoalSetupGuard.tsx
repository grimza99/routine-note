'use client';
import { useEffect, useRef } from 'react';
import { useModal } from '@/shared/hooks';
import { useCurrentMonthGoal } from './goal.quey';

export default function GoalSetupGuard() {
  const { data: currentGoalData } = useCurrentMonthGoal();
  const { openModal } = useModal();
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    if (!currentGoalData) {
      return;
    }

    if (currentGoalData) {
      const { goalWorkoutDays } = currentGoalData;
      if (!!goalWorkoutDays || hasOpenedRef.current) {
        return;
      }
    }

    openModal('monthlyGoalSetup');
    hasOpenedRef.current = true;
  }, [openModal, currentGoalData]);
  return null;
}
