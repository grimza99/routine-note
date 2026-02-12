'use client';
import { Button, InputField } from '@/shared';
import { FormEvent, useState } from 'react';
import { useLoginMutation } from '../model/auth.mutation';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('next') ?? undefined;

  const [payload, setPayload] = useState({
    email: '',
    password: '',
  });

  const { mutateAsync: login, isPending } = useLoginMutation(redirectTo);

  //handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(payload);
  };

  const isButtonDisabeld = !payload.email || payload.password.length < 6 || isPending;

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
      <InputField
        label="비밀번호"
        type="password"
        placeholder="비밀번호를 입력하세요"
        value={payload.password}
        required
        name="password"
        onChange={handleChange}
        helperText="6자 이상의 비밀번호를 입력하세요."
      />
      <Button type="submit" disabled={isButtonDisabeld} label="로그인" />
    </form>
  );
}
