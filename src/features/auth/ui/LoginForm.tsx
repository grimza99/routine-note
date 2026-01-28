'use client';
import { Button, InputField } from '@/shared';
import { FormEvent, useState } from 'react';
import { useLoginMutation } from '../model/auth.mutation';

export default function LoginForm() {
  const [payload, setPayload] = useState({
    email: '',
    password: '',
  });

  const { mutateAsync: login, isPending } = useLoginMutation();

  //handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault();
      await login(payload);
    } catch (error) {
      //todo: error handling
    }
  };

  const isButtonDisabeld = !payload.email || !payload.password || isPending;

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
      />
      <Button type="submit" disabled={isButtonDisabeld}>
        로그인
      </Button>
    </form>
  );
}
