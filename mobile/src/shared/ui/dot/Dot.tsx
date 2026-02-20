import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

type DotProps = {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export const Dot = ({ size = 4, color = '#E60023', style }: DotProps) => {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};
