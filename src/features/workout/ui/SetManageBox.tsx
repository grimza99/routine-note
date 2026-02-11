import { ChangeEvent, useState } from 'react';

interface ISet {
  weight: number;
  reps: number;
}
const INITIALTE_SET: ISet = {
  weight: 0,
  reps: 0,
};
interface SetManageBoxProps {
  index: number;
  initialSet?: {
    weight: number;
    reps: number;
  };
  onChange: (weight: number, reps: number) => void;
}
export default function SetManageBox({ index, initialSet, onChange }: SetManageBoxProps) {
  const [currentSet, setCurrentSet] = useState<ISet>(initialSet || INITIALTE_SET);

  const handChangeSet = (value: string, name: keyof ISet) => {
    const nextSet = {
      ...currentSet,
      [name]: Number(value),
    };
    setCurrentSet(nextSet);
    onChange(nextSet.weight, nextSet.reps);
  };

  return (
    <div className="rounded-md px-2 py-1 text-xs text-text-primary border border-border flex gap-2 items-center">
      <strong>{index + 1}set : </strong>
      <input
        type="number"
        name="weight"
        value={currentSet.weight}
        onChange={(e: ChangeEvent<HTMLInputElement>) => handChangeSet(e.target.value, e.target.name as keyof ISet)}
        className="border border-border rounded-xl px-2 w-20"
      />
      <strong>kg</strong>
      <strong>×</strong>
      <input
        value={currentSet.reps}
        name="reps"
        onChange={(e: ChangeEvent<HTMLInputElement>) => handChangeSet(e.target.value, e.target.name as keyof ISet)}
        type="number"
        className="border border-border rounded-xl px-2 w-20"
      />
      <strong>회</strong>
    </div>
  );
}
