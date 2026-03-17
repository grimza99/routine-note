import type { StyleProp, TextStyle, TextInputProps } from 'react-native';
import { StyleSheet, TextInput, Text, View } from 'react-native';

type InputProps = Omit<TextInputProps, 'style'> & {
  style?: StyleProp<TextStyle>;
  helperText?: string;
};

export const Input = ({ style, helperText, placeholderTextColor, editable = true, ...props }: InputProps) => {
  return (
    <View>
      <TextInput
        {...props}
        editable={editable}
        placeholderTextColor={placeholderTextColor ?? '#666666'}
        style={[styles.base, !editable && styles.disabled, style]}
      />
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderColor: '#E6E6E6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    color: '#1A1A1A',
  },
  disabled: {
    backgroundColor: '#F7F7F7',
    color: '#666666',
  },
  helperText: {
    color: '#666666',
    fontSize: 10,
    marginLeft: 4,
  },
});
