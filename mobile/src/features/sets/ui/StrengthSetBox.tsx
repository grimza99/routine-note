import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Input } from '../../../shared/ui';
import { IStrengthSet } from '@routine-note/package-shared';

const INITIALTE_SET: IStrengthSet = {
  id: '',
  weight: 0,
  reps: 0,
};
interface IStrengthSetBoxProps {
  index: number;
  initialSet?: IStrengthSet;
  onChange: (weight: number, reps: number) => void;
}
export default function StrengthSetBox({ index, initialSet, onChange }: IStrengthSetBoxProps) {
  const [currentSet, setCurrentSet] = useState<IStrengthSet>(initialSet || INITIALTE_SET);

  const handChangeSet = (value: string, name: keyof IStrengthSet) => {
    const nextSet = {
      ...currentSet,
      [name]: Number(value),
    };
    setCurrentSet(nextSet);
    onChange(nextSet.weight, nextSet.reps);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.xsText}>{index + 1}set : </Text>
      <Input
        value={currentSet.weight.toString()}
        keyboardType="numeric"
        onChange={(text) => handChangeSet(text.nativeEvent.text, 'weight')}
        style={styles.input}
      />
      <Text style={styles.xsText}>kg</Text>
      <Text style={styles.xsText}>×</Text>
      <Input
        value={currentSet.reps.toString()}
        keyboardType="numeric"
        onChange={(text) => handChangeSet(text.nativeEvent.text, 'reps')}
        style={styles.input}
      />
      <Text style={styles.xsText}>회</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  xsText: {
    fontSize: 12,
  },
  input: {
    width: 60,
    height: 35,

    paddingHorizontal: 4,
    paddingVertical: 0,
    color: '#000',
  },
});
