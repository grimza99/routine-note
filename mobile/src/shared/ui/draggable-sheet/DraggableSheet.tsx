import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PanResponderGestureState,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CLOSE_THRESHOLD = 120;

type RenderContext = {
  close: () => void;
};

type DraggableSheetProps = {
  visible: boolean;
  onClose: () => void;
  children?: ReactNode;
  renderContent?: (context: RenderContext) => ReactNode;
  height?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export const DraggableSheet = ({
  visible,
  onClose,
  children,
  renderContent,
  height = Math.min(700, Math.round(SCREEN_HEIGHT * 0.75)),
  contentContainerStyle,
}: DraggableSheetProps) => {
  const [isMounted, setIsMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(height)).current;

  const animateTo = useCallback(
    (toValue: number, onEnd?: () => void) => {
      Animated.timing(translateY, {
        toValue,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && onEnd) {
          onEnd();
        }
      });
    },
    [translateY],
  );

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      translateY.setValue(height);
      animateTo(0);
      return;
    }

    if (!isMounted) {
      return;
    }

    animateTo(height, () => setIsMounted(false));
  }, [animateTo, height, isMounted, translateY, visible]);

  const requestClose = useCallback(() => {
    animateTo(height, onClose);
  }, [animateTo, height, onClose]);

  const onRelease = useCallback(
    (dy: number, vy: number) => {
      if (dy > CLOSE_THRESHOLD || vy > 1.2) {
        requestClose();
        return;
      }

      animateTo(0);
    },
    [animateTo, CLOSE_THRESHOLD, requestClose],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event: GestureResponderEvent, gestureState: PanResponderGestureState) =>
          Math.abs(gestureState.dy) > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          const nextValue = Math.max(0, gestureState.dy);
          translateY.setValue(nextValue);
        },
        onPanResponderRelease: (_event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          onRelease(gestureState.dy, gestureState.vy);
        },
        onPanResponderTerminate: (_event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
          onRelease(gestureState.dy, gestureState.vy);
        },
      }),
    [onRelease, translateY],
  );

  const overlayOpacity = translateY.interpolate({
    inputRange: [0, height],
    outputRange: [0.45, 0],
    extrapolate: 'clamp',
  });

  if (!isMounted) {
    return null;
  }

  return (
    <Modal transparent visible={isMounted} animationType="none" onRequestClose={requestClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
          <Pressable style={styles.overlayPressArea} onPress={requestClose} disabled={false} />
        </Animated.View>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.sheetContainer, { height, transform: [{ translateY }] }, contentContainerStyle]}
        >
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>
          {renderContent ? renderContent({ close: requestClose }) : children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1A1A1A',
  },
  overlayPressArea: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
  },
});
