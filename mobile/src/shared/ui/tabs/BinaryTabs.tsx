import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type BinaryTabsOption<T extends string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

type BinaryTabsProps<T extends string> = {
  options: [BinaryTabsOption<T>, BinaryTabsOption<T>];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export const BinaryTabs = <T extends string>({ options, value, onChange, style }: BinaryTabsProps<T>) => {
  return (
    <View accessibilityRole="tablist" style={[styles.container, style]}>
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ disabled: option.disabled, selected: isActive }}
            disabled={option.disabled}
            onPress={() => onChange(option.value)}
            style={[
              styles.tab,
              isActive ? styles.activeTab : styles.inactiveTab,
              option.disabled && styles.disabledTab,
            ]}
          >
            <Text
              style={[
                styles.label,
                isActive ? styles.activeLabel : styles.inactiveLabel,
                option.disabled && styles.disabledLabel,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 130,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    backgroundColor: '#FFFFFF',
    padding: 2,
    gap: 2,
  },
  tab: {
    display: 'flex',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  activeTab: {
    backgroundColor: '#E60023',
  },
  inactiveTab: {
    backgroundColor: '#FFFFFF',
  },
  disabledTab: {
    opacity: 0.5,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  } satisfies TextStyle,
  activeLabel: {
    color: '#FFFFFF',
  },
  inactiveLabel: {
    color: '#666666',
  },
  disabledLabel: {
    color: '#E0E0E0',
  },
});
