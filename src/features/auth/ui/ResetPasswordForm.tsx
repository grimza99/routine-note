'use client';
import { Button, InputField } from '@/shared';
import { FormEvent, useState } from 'react';
import { usePasswordResetConfirmMutation } from '../model/auth.mutation';

export function ResetPasswordForm() {
  const [payload, setPayload] = useState({
    newPassword: '',
  });

  const { mutateAsync: resetPasswordConfirm, isPending } = usePasswordResetConfirmMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await resetPasswordConfirm(payload);
  };

  const isButtonDisabeld = payload.newPassword.length < 6 || isPending;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <InputField
        label="비밀번호"
        type="password"
        placeholder="새로운 비밀번호를 입력하세요"
        value={payload.newPassword}
        required
        name="newPassword"
        onChange={handleChange}
        helperText="6자 이상의 비밀번호를 입력하세요."
      />
      <Button type="submit" disabled={isButtonDisabeld} label="비밀번호 변경" />
    </form>
  );
}
