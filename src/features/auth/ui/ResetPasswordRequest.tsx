'use client';
import { Button, InputField } from '@/shared';
import { FormEvent, useState } from 'react';
import { usePasswordResetMutation } from '../model/auth.mutation';

export default function ResetPasswordRequest() {
  const [payload, setPayload] = useState({
    email: '',
  });

  const { mutateAsync: passwordResetRequest, isPending } = usePasswordResetMutation();

  //handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await passwordResetRequest(payload);
  };

  const isButtonDisabeld = !payload.email || isPending;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <InputField
        label="이메일"
        type="email"
        placeholder="이메일을 입력하세요"
        value={payload.email}
        required
        name="email"
        onChange={handleChange}
      />
      <Button type="submit" disabled={isButtonDisabeld} label="비밀번호 재설정 이메일 전송" />
    </form>
  );
}
