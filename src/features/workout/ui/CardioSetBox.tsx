import { A11Y_LABELS } from '@/shared/constants';
import { ICardioSet } from '@routine-note/package-shared';
import { ChangeEvent, useState } from 'react';

const INITIALTE_SET: ICardioSet = {
  id: '',
  type: 'DISTANCE',
  value: 0,
};

interface ICardioSetBoxProps {
  index: number;
  initialSet?: ICardioSet;
  onChange: (type: ICardioSet['type'], value: number) => void;
}
export default function CardioSetBox({ index, initialSet, onChange }: ICardioSetBoxProps) {
  const [currentSet, setCurrentSet] = useState<ICardioSet>(initialSet || INITIALTE_SET);

  const handChangeSet = (type: ICardioSet['type'], value: number) => {
    const nextSet = {
      ...currentSet,
      type,
      value,
    };
    setCurrentSet(nextSet);
    onChange(nextSet.type, nextSet.value);
  };

  const valueLabel = currentSet.type === 'DISTANCE' ? 'km' : currentSet.type === 'DURATION' ? '분' : 'km/h';
  return (
    <div className="rounded-md px-2 py-1 text-xs text-text-primary border border-border flex gap-2 items-center">
      <strong>{index + 1}set : </strong>
      <select
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          handChangeSet(e.target.value as ICardioSet['type'], currentSet.value)
        }
        value={currentSet.type}
        className="border border-border rounded-xl px-2 w-28"
        aria-label={A11Y_LABELS.WORKOUT_SETS.cardioTypeSelect}
      >
        <option value="DISTANCE">거리</option>
        <option value="DURATION">시간</option>
        <option value="SPEED">속도</option>
      </select>

      <strong>기준</strong>
      <input
        aria-label={A11Y_LABELS.WORKOUT_SETS.cardioValueInput}
        value={currentSet.value}
        name="cardioValue"
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handChangeSet(currentSet.type, e.target.value as unknown as number)
        }
        type="number"
        className="border border-border rounded-xl px-2 w-20"
      />
      <strong>{valueLabel}</strong>
    </div>
  );
}
