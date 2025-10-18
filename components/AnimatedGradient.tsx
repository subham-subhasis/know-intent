import { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function AnimatedGradient() {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const startX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const startY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const endX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.7],
  });

  const endY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.6],
  });

  return (
    <AnimatedLinearGradient
      colors={['#F8F9FA', '#E8EAED', '#C4C8CC', '#9BA1A8', '#6B7280', '#4B5563', '#374151', '#1F2937']}
      locations={[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]}
      style={StyleSheet.absoluteFillObject}
      start={{ x: startX, y: startY }}
      end={{ x: endX, y: endY }}
    />
  );
}
