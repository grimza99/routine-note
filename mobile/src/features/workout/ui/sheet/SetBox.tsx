import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Input } from '../../../../shared/ui';

interface ISet {
  weight: string;
  reps: string;
}
const INITIALTE_SET: ISet = {
  weight: '0',
  reps: '0',
};
interface SetBoxProps {
  index: number;
  initialSet?: {
    weight: string;
    reps: string;
  };
  onChange: (weight: string, reps: string) => void;
}
export default function SetBox({ index, initialSet, onChange }: SetBoxProps) {
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
    <View style={styles.container}>
      <Text>{index + 1}set : </Text>
      <Input
        value={currentSet.weight}
        keyboardType="numeric"
        onChange={(text) => handChangeSet(text.nativeEvent.text, 'weight')}
        style={styles.input}
      />
      <Text>kg</Text>
      <Text>×</Text>
      <Input
        value={currentSet.reps}
        keyboardType="numeric"
        onChange={(text) => handChangeSet(text.nativeEvent.text, 'reps')}
        style={styles.input}
      />
      <Text>회</Text>
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
  input: {
    width: 60,
    height: 20,
    paddingHorizontal: 4,
    paddingVertical: 0,
    color: '#000',
  },
});
