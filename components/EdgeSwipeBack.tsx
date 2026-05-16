import { useMemo } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

interface EdgeSwipeBackProps {
  onBack: () => void;
  edgeWidth?: number;
  triggerDistance?: number;
}

export function EdgeSwipeBack({
  onBack,
  edgeWidth = 32,
  triggerDistance = 72,
}: EdgeSwipeBackProps) {
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const startedAtEdge = gestureState.x0 <= edgeWidth;
          const isHorizontalSwipe = gestureState.dx > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;

          return startedAtEdge && isHorizontalSwipe;
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          const startedAtEdge = gestureState.x0 <= edgeWidth;
          const isHorizontalSwipe = gestureState.dx > 12 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;

          return startedAtEdge && isHorizontalSwipe;
        },
        onPanResponderRelease: (_, gestureState) => {
          const startedAtEdge = gestureState.x0 <= edgeWidth;
          const completedSwipe =
            gestureState.dx >= triggerDistance &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;

          if (startedAtEdge && completedSwipe) {
            onBack();
          }
        },
      }),
    [edgeWidth, onBack, triggerDistance]
  );

  return <View style={[styles.edgeZone, { width: edgeWidth }]} {...panResponder.panHandlers} />;
}

const styles = StyleSheet.create({
  edgeZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    backgroundColor: 'transparent',
  },
});
