import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThumbsUp, ThumbsDown, GitBranch, Eye, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import MediaCarousel from './MediaCarousel';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  title: string;
  description?: string;
  likes_count: number;
  dislikes_count: number;
  spider_chains_count: number;
  views_count: number;
  media: Array<{
    id: string;
    media_url: string;
    media_type: 'image' | 'video';
    order_index: number;
  }>;
  child_posts?: Post[];
}

interface SpiderWebViewProps {
  posts: Post[];
  onPostPress?: (postId: string) => void;
  onViewAllChains?: (postId: string) => void;
  onEndReached?: () => void;
  onLoadChildPosts?: (postId: string, page: number) => Promise<Post[]>;
  isLoading?: boolean;
}

export default function SpiderWebView({
  posts,
  onPostPress,
  onViewAllChains,
  onEndReached,
  onLoadChildPosts,
  isLoading,
}: SpiderWebViewProps) {
  const { colors } = useTheme();
  const [expandedPosts, setExpandedPosts] = useState<Record<string, Post[]>>({});
  const [loadingChildren, setLoadingChildren] = useState<Record<string, boolean>>({});

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const loadFirstChild = async (postId: string) => {
    if (loadingChildren[postId] || expandedPosts[postId]) return;

    setLoadingChildren({ ...loadingChildren, [postId]: true });
    try {
      if (onLoadChildPosts) {
        const children = await onLoadChildPosts(postId, 1);
        setExpandedPosts({ ...expandedPosts, [postId]: children.slice(0, 1) });
      }
    } catch (error) {
      console.error('Error loading child posts:', error);
    } finally {
      setLoadingChildren({ ...loadingChildren, [postId]: false });
    }
  };

  const renderSpiderChain = (post: Post, depth: number = 0) => {
    const isRoot = depth === 0;
    const cardWidth = isRoot ? width - 32 : width * 0.75;
    const cardHeight = isRoot ? 220 : 140;
    const childPost = expandedPosts[post.id]?.[0];
    const hasMoreChains = post.spider_chains_count > 1;

    return (
      <View key={`${post.id}-${depth}`} style={[styles.spiderNode, isRoot && styles.rootNode]}>
        <TouchableOpacity
          style={[styles.postCard, { width: cardWidth }]}
          onPress={() => onPostPress?.(post.id)}
          activeOpacity={0.8}
        >
          <View style={[styles.cardContent, { height: cardHeight }]}>
            <MediaCarousel
              media={post.media}
              width={cardWidth}
              height={cardHeight}
              showIndicators={post.media.length > 1}
              borderRadius={16}
            />

            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
              style={styles.gradientOverlay}
            >
              <View style={styles.cardInfo}>
                <Text style={[styles.postTitle, isRoot && styles.rootTitle]} numberOfLines={2}>
                  {post.title}
                </Text>

                <View style={styles.statsContainer}>
                  {isRoot && (
                    <View style={styles.statItem}>
                      <Eye size={14} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.statText}>{formatCount(post.views_count)}</Text>
                    </View>
                  )}
                  <View style={styles.statItem}>
                    <ThumbsUp size={14} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.statText}>{formatCount(post.likes_count)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <ThumbsDown size={14} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.statText}>{formatCount(post.dislikes_count)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <GitBranch size={14} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.statText}>{formatCount(post.spider_chains_count)}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>

        {isRoot && post.spider_chains_count > 0 && (
          <View style={styles.chainContainer}>
            <View style={[styles.connectionLine, { backgroundColor: colors.border }]} />

            {loadingChildren[post.id] ? (
              <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : childPost ? (
              <View style={styles.childWrapper}>
                {renderSpiderChain(childPost, depth + 1)}
              </View>
            ) : null}

            {hasMoreChains && (
              <TouchableOpacity
                style={[styles.viewAllButton, { backgroundColor: colors.primary }]}
                onPress={() => onViewAllChains?.(post.id)}
              >
                <Text style={styles.viewAllText}>
                  View All {post.spider_chains_count} Intent Chains
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderItem = ({ item }: { item: Post }) => renderSpiderChain(item, 0);

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
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
      ListFooterComponent={
        isLoading ? (
          <View style={styles.footerLoader}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  spiderNode: {
    marginBottom: 24,
  },
  rootNode: {
    marginBottom: 32,
  },
  postCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContent: {
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
  },
  cardInfo: {
    padding: 16,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 18,
  },
  rootTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chainContainer: {
    marginTop: 16,
    paddingLeft: 20,
  },
  connectionLine: {
    position: 'absolute',
    top: 0,
    left: width / 2 - 16,
    width: 2,
    height: 16,
  },
  childWrapper: {
    marginTop: 16,
  },
  loadChainButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadChainText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
