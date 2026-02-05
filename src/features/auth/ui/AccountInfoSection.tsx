'use client';

import { useEffect, useState } from 'react';
import { Button, InputField } from '@/shared';

interface IInfo {
  nickname: string;
  goalWorkoutDays?: number | null;
}
type AccountInfoSectionProps = {
  email: string;
  nickname: string;
  goalWorkoutDays?: number | null;
  onSaveInfo?: (info: IInfo) => void;
};

export default function AccountInfoSection({ email, nickname, goalWorkoutDays, onSaveInfo }: AccountInfoSectionProps) {
  const [info, setInfo] = useState({ nickname, goalWorkoutDays });

  const handleChangeInfo = (value: string | number, name: string) => {
    switch (name) {
      case 'goalWorkoutDays':
        setInfo((prev) => ({ ...prev, goalWorkoutDays: Number(value) }));
        break;
      case 'nickname':
        setInfo((prev) => ({ ...prev, nickname: String(value) }));
        break;
      default:
        return;
    }
  };

  useEffect(() => {
    setInfo({ nickname, goalWorkoutDays });
  }, [nickname, goalWorkoutDays]);

  console.log(info);
  return (
    <section className="flex flex-col gap-4 rounded-lg border p-4" style={{ borderColor: 'var(--border)' }}>
      <div className="w-full flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text-primary">계정 정보</h2>
        <Button label="변경" onClick={() => onSaveInfo?.(info)} className="w-fit h-fit" />
      </div>
      <InputField label="이메일" value={email} onChange={() => {}} disabled />
      <InputField
        label="닉네임"
        value={info.nickname}
        onChange={(e) => handleChangeInfo(e.target.value, 'nickname')}
        className="flex-1"
      />
      <InputField
        label="이번달 목표 운동 일수"
        type="number"
        value={!info.goalWorkoutDays ? '' : info.goalWorkoutDays}
        placeholder='운동 목표일을 설정해보세요 (예: "15")'
        onChange={(e) => handleChangeInfo(e.target.value, 'goalWorkoutDays')}
        className="flex-1"
      />
    </section>
  );
}
