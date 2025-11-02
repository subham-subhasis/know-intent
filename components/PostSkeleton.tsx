import { View, StyleSheet } from 'react-native';
import { ShimmerPlaceholder } from './ShimmerPlaceholder';
import { useTheme } from '@/contexts/ThemeContext';

export function PostSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <ShimmerPlaceholder width={40} height={40} borderRadius={20} />
        <View style={styles.headerText}>
          <ShimmerPlaceholder width={120} height={14} borderRadius={4} />
          <ShimmerPlaceholder width={80} height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>

      <View style={styles.content}>
        <ShimmerPlaceholder width="100%" height={12} borderRadius={4} />
        <ShimmerPlaceholder width="90%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
        <ShimmerPlaceholder width="70%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
      </View>

      <View style={styles.footer}>
        <ShimmerPlaceholder width={60} height={24} borderRadius={12} />
        <ShimmerPlaceholder width={60} height={24} borderRadius={12} />
        <ShimmerPlaceholder width={80} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  content: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
