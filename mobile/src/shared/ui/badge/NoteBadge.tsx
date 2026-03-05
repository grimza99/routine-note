import { StyleSheet, View } from 'react-native';

export function NoteBadge() {
  return (
    <>
      <View style={styles.badgeBackground} />
      <View style={styles.colorBadge} />
    </>
  );
}

const styles = StyleSheet.create({
  badgeBackground: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    backgroundColor: '#ffffff',
  },
  colorBadge: {
    position: 'absolute',
    top: 7,
    right: 0,
    borderBottomColor: '#E60023',
    borderBottomWidth: 14,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '225deg' }],
    zIndex: 10,
  },
});
