'use client';
import { useEffect, useRef, useState } from 'react';
import { GoalSetupPromptModal } from './GoalSetupPromptModal';
import { goalApi } from '../api/goalApi';

export default function GoalSetupGuard() {
  const [isGoalSetupPromptOpen, setIsGoalSetupPromptOpen] = useState(true);
  const [goalData, setGoalData] = useState<{
    month: string;
    goalWorkoutDays: number;
    hidden_setup_prompt: boolean;
  } | null>(null);
  const hasOpenedRef = useRef(false);

  const initialize = async () => {
    const goalData = await goalApi.getGoal();
    setGoalData(goalData);
  };

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!goalData) {
      return;
    }
    if (goalData) {
      if (!!goalData.goalWorkoutDays || hasOpenedRef.current) {
        return;
      }
      if (goalData.hidden_setup_prompt) {
        return;
      }
    }

    setIsGoalSetupPromptOpen(true);
    hasOpenedRef.current = true;
  }, [goalData]);

  if (isGoalSetupPromptOpen) {
    return <GoalSetupPromptModal visible={isGoalSetupPromptOpen} onClose={() => setIsGoalSetupPromptOpen(false)} />;
  }
  return null;
}
