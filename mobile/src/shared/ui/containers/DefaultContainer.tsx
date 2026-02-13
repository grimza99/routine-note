import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';

type Props = {
  variant?: 'default' | 'primary';
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const DefaultContainer = ({ variant = 'default', children, style }: Props) => {
  const variantStyle = variantStyleMap[variant];

  return <View style={[styles.default, variantStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  default: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 12,
  },

  primary: {
    borderWidth: 1,
    borderColor: '#E60023',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 12,
  },
});
const variantStyleMap = {
  primary: styles.primary,
  default: styles.default,
} as const;
