import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ErrorToastProps {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
  visible: boolean;
}

export function ErrorToast({ message, onRetry, onDismiss, visible }: ErrorToastProps) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      if (!onRetry) {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, onRetry, onDismiss, translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: '#DC2626',
          transform: [{ translateY }],
        },
      ]}
    >
      <AlertCircle size={20} color="#FFFFFF" strokeWidth={2} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onDismiss}
        activeOpacity={0.7}
      >
        <X size={18} color="#FFFFFF" strokeWidth={2} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    marginLeft: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});
