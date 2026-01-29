'use client';
import { Button, InputField } from '@/shared';
import { FormEvent, useState } from 'react';
import { useSignupMutation } from '../model/auth.mutation';

export default function SignupForm() {
  const [payload, setPayload] = useState({
    email: '',
    username: '',
    nickname: '',
    password: '',
    age: 15,
    policy_policy: false,
  });
  const { mutateAsync: signup, isPending } = useSignupMutation();

  //handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault();
      await signup(payload);
    } catch (error) {
      //todo: error handling
    }
  };

  const isButtonDisabeld = isPending || !payload.email || !payload.username || !payload.password || !payload.age;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <InputField
        label="이메일"
        type="email"
        placeholder="이메일을 입력하세요"
        required
        value={payload.email}
        onChange={handleChange}
        name="email"
      />
      <InputField
        label="이름"
        placeholder="이름을 입력하세요"
        required
        value={payload.username}
        onChange={handleChange}
        name="username"
      />
      <InputField
        label="닉네임"
        placeholder="닉네임을 입력하세요"
        helperText="미입력시 이름이 닉네임으로 설정됩니다."
        value={payload.nickname}
        onChange={handleChange}
        name="nickname"
      />
      <InputField
        label="비밀번호"
        type="password"
        placeholder="비밀번호를 입력하세요"
        required
        value={payload.password}
        onChange={handleChange}
        name="password"
      />
      <InputField
        label="나이"
        type="number"
        min={1}
        placeholder="나이를 입력하세요"
        required
        value={payload.age}
        onChange={handleChange}
        name="age"
      />
      <label className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <input
          type="checkbox"
          className="mt-1"
          checked={payload.policy_policy}
          onChange={handleChange}
          name="policy_policy"
        />
        개인정보 수집 및 이용에 동의합니다.
      </label>
      <Button type="submit" disabled={isButtonDisabeld} label="회원가입" />
    </form>
  );
}
