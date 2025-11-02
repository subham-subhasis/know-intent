import { View, StyleSheet } from 'react-native';
import { ShimmerPlaceholder } from './ShimmerPlaceholder';
import { useTheme } from '@/contexts/ThemeContext';

export function NotificationSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
      <ShimmerPlaceholder width={48} height={48} borderRadius={24} />

      <View style={styles.content}>
        <ShimmerPlaceholder width={140} height={14} borderRadius={4} />
        <ShimmerPlaceholder width="90%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
        <ShimmerPlaceholder width={60} height={10} borderRadius={4} style={{ marginTop: 6 }} />
      </View>

      <ShimmerPlaceholder width={36} height={36} borderRadius={18} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
    marginHorizontal: 12,
  },
});
