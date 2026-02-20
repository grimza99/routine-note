import type { PressableProps, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export const Button = ({ label, variant = 'primary', disabled, style, textStyle, ...props }: ButtonProps) => {
  const variantStyle = variantStyleMap[variant];

  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={[styles.base, variantStyle.container, disabled && styles.disabledContainer, style]}
    >
      <Text style={[styles.baseText, variantStyle.text, disabled && styles.disabledText, textStyle]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  baseText: {
    fontWeight: '600',
  },
  disabledContainer: {
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  disabledText: {
    color: '#E0E0E0',
  },
  primaryContainer: {
    borderColor: '#E60023',
    backgroundColor: '#E60023',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryContainer: {
    borderColor: '#E60023',
    backgroundColor: '#FFFFFF',
  },
  secondaryText: {
    color: '#E60023',
  },
  tertiaryContainer: {
    borderColor: '#E6E6E6',
    backgroundColor: '#FFFFFF',
  },
  tertiaryText: {
    color: '#666666',
  },
});

const variantStyleMap = {
  primary: {
    container: styles.primaryContainer,
    text: styles.primaryText,
  },
  secondary: {
    container: styles.secondaryContainer,
    text: styles.secondaryText,
  },
  tertiary: {
    container: styles.tertiaryContainer,
    text: styles.tertiaryText,
  },
} as const;
