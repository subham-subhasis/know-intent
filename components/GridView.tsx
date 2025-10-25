import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
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
      <MediaCarousel
        media={item.media}
        width={ITEM_WIDTH}
        height={ITEM_WIDTH}
        showIndicators={item.media.length > 1}
        borderRadius={12}
      />
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
    height: ITEM_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
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
