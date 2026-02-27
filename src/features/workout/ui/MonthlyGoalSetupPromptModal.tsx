'use client';

import { useState } from 'react';

import { Button, InputField } from '@/shared/ui';
import { useCreateGoalMutation } from '../model/goal.mutation';

type MonthlyGoalSetupPromptModalProps = {
  onClose: () => void;
};

export function MonthlyGoalSetupPromptModal({ onClose }: MonthlyGoalSetupPromptModalProps) {
  const [goal, setGoal] = useState('0');
  const { mutateAsync: createGoal } = useCreateGoalMutation();

  const handleSubmit = async () => {
    await createGoal({ goal });
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="flex flex-col gap-4 p-6 w-full">
      <header className="flex flex-col gap-1 text-center">
        <h2 className="text-lg font-semibold text-text-primary">이번달 목표 설정을 아직 안했어요!</h2>
        <p className="text-sm text-text-secondary">
          이번달 목표설정은 리포트 작성에 사용되는 중요한 데이터에요
          <br />
          목표설정은 마이페이지에서 언제든지 변경할 수 있어요!
        </p>
      </header>

      <InputField
        label="이번달 목표 운동 일수"
        placeholder={`이번달 목표 운동 일수를 입력해 주세요. (예: 12)`}
        value={goal}
        type="number"
        onChange={(e) => setGoal(e.target.value)}
      />

      <div className="flex justify-end gap-2">
        <Button label="닫기 (이번달 안보기)" variant="secondary" onClick={handleClose} />
        <Button label="저장" onClick={handleSubmit} aria-label={'이번달 목표 설정 확인 버튼'} />
      </div>
    </div>
  );
}
