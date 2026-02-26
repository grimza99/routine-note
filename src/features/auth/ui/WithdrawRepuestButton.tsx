'use client';
import { Button } from '@/shared/ui';
import { useWithdrawMutation } from '../model/auth.mutation';
import { A11Y_LABELS } from '@/shared/constants';

export function WithdrawRepuestButton() {
  const { mutateAsync: withdrawRequest, isPending } = useWithdrawMutation();

  const handleSubmit = async () => {
    await withdrawRequest();
  };

  return (
    <Button
      disabled={isPending}
      onClick={handleSubmit}
      label="회원 탈퇴하기"
      className="w-fit"
      variant="secondary"
      aria-label={A11Y_LABELS.AUTH.withdraw}
    />
  );
}
