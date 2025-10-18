import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function AnimatedGradient() {
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withRepeat(
      withTiming(1, {
        duration: 8000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const startX = animation.value;
    const startY = animation.value * 0.5;
    const endX = 1 - animation.value * 0.3;
    const endY = 1 - animation.value * 0.5;

    return {
      start: { x: startX, y: startY },
      end: { x: endX, y: endY },
    };
  });

  return (
    <AnimatedLinearGradient
      colors={['#F8F9FA', '#E8EAED', '#C4C8CC', '#9BA1A8', '#6B7280', '#4B5563', '#374151', '#1F2937']}
      locations={[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]}
      style={[StyleSheet.absoluteFillObject]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
}
