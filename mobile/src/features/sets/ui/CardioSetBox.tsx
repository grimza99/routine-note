import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ICardioSet } from '@routine-note/package-shared';

import { Input } from '@/shared/ui';

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
    <View style={styles.container}>
      <Text style={styles.xsText}>{index + 1}set : </Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={currentSet.type}
          onValueChange={(value) => handChangeSet(value as ICardioSet['type'], currentSet.value)}
          style={styles.picker}
        >
          <Picker.Item label="거리" value="DISTANCE" style={styles.xsText} />
          <Picker.Item label="시간" value="DURATION" style={styles.xsText} />
          <Picker.Item label="속도" value="SPEED" style={styles.xsText} />
        </Picker>
      </View>

      <Text style={styles.xsText}>기준</Text>
      <Input
        value={currentSet.value.toString()}
        keyboardType="numeric"
        onChange={(text) => handChangeSet(currentSet.type, Number(text.nativeEvent.text))}
        style={styles.input}
      />
      <Text style={styles.xsText}>{valueLabel}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 4,
    width: 120,
    height: 35,
    display: 'flex',
    justifyContent: 'center',
  },
  picker: {
    width: 120,
    height: 35,
  },
});
