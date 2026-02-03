import { useState } from 'react';

interface SetManageBoxProps {
  index: number;
  onChange: (weight: number, reps: number) => void;
}
export default function SetManageBox({ index, onChange }: SetManageBoxProps) {
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(0);

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setWeight(Number(value));
    onChange(Number(value), reps);
  };

  const handleRepsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      onChange(weight, value);
      setReps(value);
    } else {
      setReps(0);
    }
  };
  return (
    <div className="rounded-md px-2 py-1 text-xs text-white bg-primary flex gap-2 items-center">
      <strong>{index + 1}set</strong>
      <input
        type="number"
        value={weight}
        onChange={handleWeightChange}
        className="border border-white rounded-xl px-2 w-20"
      />
      <strong>kg</strong>
      <strong>×</strong>
      <input
        value={reps}
        onChange={handleRepsChange}
        type="number"
        className="border border-white rounded-xl px-2 w-20"
      />
      <strong>회</strong>
    </div>
  );
}
