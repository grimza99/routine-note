'use client';

import { useEffect, useState } from 'react';
import { Button, InputField } from '@/shared';

type AccountInfoSectionProps = {
  email: string;
  nickname: string;
  onSaveNickname?: (newNickname: string) => void;
};

export default function AccountInfoSection({ email, nickname, onSaveNickname }: AccountInfoSectionProps) {
  const [currentNickname, setCurrentNickname] = useState(nickname);

  const handleChangeNickname = (value: string) => {
    setCurrentNickname(value);
  };

  useEffect(() => {
    setCurrentNickname(nickname);
  }, [nickname]);

  return (
    <section className="flex flex-col gap-4 rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
      <h2 className="text-lg font-semibold text-text-primary">계정 정보</h2>
      <InputField label="이메일" value={email} onChange={() => {}} disabled />
      <div className="flex gap-2 items-end">
        <InputField
          label="닉네임"
          value={currentNickname}
          onChange={(e) => handleChangeNickname(e.target.value)}
          className="flex-1"
        />
        <Button label="변경" onClick={() => onSaveNickname?.(currentNickname)} className="w-fit h-fit" />
      </div>
    </section>
  );
}
