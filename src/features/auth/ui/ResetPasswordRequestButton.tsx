'use client';
import { Button } from '@/shared';
import { usePasswordResetMutation } from '../model/auth.mutation';

export function ResetPasswordRequestButton() {
  const { mutateAsync: passwordResetRequest, isPending } = usePasswordResetMutation();

  const handleSubmit = async () => {
    await passwordResetRequest();
  };

  return (
    <Button
      type="button"
      disabled={isPending}
      onClick={handleSubmit}
      label="비밀번호 재설정 이메일 전송"
      className="w-fit"
    />
  );
}
