import { Pressable, StyleSheet, View, Text } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

type NumberStepperProps = {
  value: number;
  onDecrease: (value: number) => void;
  onIncrease: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: StyleSheet | any;
  disabled?: boolean;
  ariaLabel?: string;
};

export function NumberStepper({
  value,
  min = 1,
  max,
  onDecrease,
  onIncrease,
  step = 1,
  style,
  disabled = false,
  ariaLabel = '값',
}: NumberStepperProps) {
  const nextDecrement = value - step;
  const nextIncrement = value + step;
  const isDecrementDisabled = disabled || (min !== undefined && nextDecrement < min);
  const isIncrementDisabled = disabled || (max !== undefined && nextIncrement > max);

  const handleDecrement = () => {
    if (isDecrementDisabled) return;
    onDecrease(nextDecrement);
  };

  const handleIncrement = () => {
    if (isIncrementDisabled) return;
    onIncrease(nextIncrement);
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable
        aria-label={`${ariaLabel} 감소`}
        style={styles.button}
        onPress={handleDecrement}
        disabled={isDecrementDisabled}
      >
        <AntDesign name="minus" size={16} color="white" onPress={handleDecrement} />
      </Pressable>
      <Text style={styles.valueText}>{value}</Text>
      <Pressable
        aria-label={`${ariaLabel} 증가`}
        style={styles.button}
        onPress={handleIncrement}
        disabled={isIncrementDisabled}
      >
        <AntDesign name="plus" size={16} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    backgroundColor: '#E60023',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  button: {
    display: 'flex',
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
  },
  valueText: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
