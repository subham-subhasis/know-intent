import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { ThumbsUp, ThumbsDown, GitBranch } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import MediaCarousel from './MediaCarousel';

const { width } = Dimensions.get('window');
const GRID_SPACING = 8;
const GRID_COLUMNS = 3;
const ITEM_WIDTH = (width - (GRID_COLUMNS + 1) * GRID_SPACING) / GRID_COLUMNS;

interface Post {
  id: string;
  title: string;
  likes_count: number;
  dislikes_count: number;
  spider_chains_count: number;
  media: Array<{
    id: string;
    media_url: string;
    media_type: 'image' | 'video';
    order_index: number;
  }>;
}

interface GridViewProps {
  posts: Post[];
  onPostPress?: (postId: string) => void;
  onEndReached?: () => void;
  isLoading?: boolean;
}

export default function GridView({ posts, onPostPress, onEndReached, isLoading }: GridViewProps) {
  const { colors } = useTheme();

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={[styles.gridItem, { backgroundColor: colors.surface }]}
      onPress={() => onPostPress?.(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.mediaWrapper}>
        <MediaCarousel
          media={item.media}
          width={ITEM_WIDTH}
          height={ITEM_WIDTH}
          showIndicators={item.media.length > 1}
          borderRadius={12}
        />
      </View>

      <View style={[styles.statsOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <ThumbsUp size={6} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.statText}>{formatCount(item.likes_count)}</Text>
          </View>
          <View style={styles.statItem}>
            <ThumbsDown size={6} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.statText}>{formatCount(item.dislikes_count)}</Text>
          </View>
          <View style={styles.statItem}>
            <GitBranch size={6} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.statText}>{formatCount(item.spider_chains_count)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={GRID_COLUMNS}
      contentContainerStyle={styles.gridContainer}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No posts yet
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  gridContainer: {
    padding: GRID_SPACING,
  },
  columnWrapper: {
    gap: GRID_SPACING,
    marginBottom: GRID_SPACING,
  },
  gridItem: {
    width: ITEM_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaWrapper: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 6,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: 5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
