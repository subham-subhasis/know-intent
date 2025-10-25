import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThumbsUp, ThumbsDown, X, ArrowUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import MediaCarousel from '@/components/MediaCarousel';

const { width, height } = Dimensions.get('window');

interface Post {
  id: string;
  title: string;
  description?: string;
  likes_count: number;
  dislikes_count: number;
  spider_chains_count: number;
  views_count: number;
  user_liked: boolean;
  user_disliked: boolean;
  media: Array<{
    id: string;
    media_url: string;
    media_type: 'image' | 'video';
    order_index: number;
  }>;
}

const DUMMY_POSTS: Record<string, Post> = {
  '1': {
    id: '1',
    title: 'The Future of AI in Healthcare',
    description: 'Exploring how artificial intelligence is revolutionizing medical diagnostics',
    likes_count: 1243,
    dislikes_count: 45,
    spider_chains_count: 87,
    views_count: 15420,
    user_liked: false,
    user_disliked: false,
    media: [
      {
        id: 'm1',
        media_url: 'https://images.pexels.com/photos/8438918/pexels-photo-8438918.jpeg',
        media_type: 'image',
        order_index: 0,
      },
      {
        id: 'm2',
        media_url: 'https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg',
        media_type: 'image',
        order_index: 1,
      },
    ],
  },
  '2': {
    id: '2',
    title: 'Sustainable Living Tips',
    description: 'Simple ways to reduce your carbon footprint',
    likes_count: 892,
    dislikes_count: 23,
    spider_chains_count: 54,
    views_count: 9845,
    user_liked: false,
    user_disliked: false,
    media: [
      {
        id: 'm3',
        media_url: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg',
        media_type: 'image',
        order_index: 0,
      },
    ],
  },
  '3': {
    id: '3',
    title: 'Mastering React Native',
    description: 'Advanced patterns and best practices for mobile development',
    likes_count: 2156,
    dislikes_count: 67,
    spider_chains_count: 143,
    views_count: 28934,
    user_liked: false,
    user_disliked: false,
    media: [
      {
        id: 'm4',
        media_url: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg',
        media_type: 'image',
        order_index: 0,
      },
      {
        id: 'm5',
        media_url: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg',
        media_type: 'image',
        order_index: 1,
      },
      {
        id: 'm6',
        media_url: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg',
        media_type: 'image',
        order_index: 2,
      },
    ],
  },
};

const ALL_CHILD_POSTS: Post[] = [
  {
    id: 'c1',
    title: 'AI Ethics and Privacy Concerns',
    description: 'Discussing the ethical implications of AI in healthcare',
    likes_count: 567,
    dislikes_count: 23,
    spider_chains_count: 34,
    views_count: 6789,
    user_liked: false,
    user_disliked: false,
    media: [
      {
        id: 'mc1',
        media_url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
        media_type: 'image',
        order_index: 0,
      },
    ],
  },
  {
    id: 'c2',
    title: 'Machine Learning Models in Diagnosis',
    description: 'How ML is improving diagnostic accuracy',
    likes_count: 823,
    dislikes_count: 31,
    spider_chains_count: 45,
    views_count: 9234,
    user_liked: false,
    user_disliked: false,
    media: [
      {
        id: 'mc2',
        media_url: 'https://images.pexels.com/photos/8438979/pexels-photo-8438979.jpeg',
        media_type: 'image',
        order_index: 0,
      },
    ],
  },
  {
    id: 'c3',
    title: 'Telemedicine Revolution',
    description: 'Remote healthcare powered by AI',
    likes_count: 445,
    dislikes_count: 18,
    spider_chains_count: 28,
    views_count: 5432,
    user_liked: false,
    user_disliked: false,
    media: [
      {
        id: 'mc3',
        media_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
        media_type: 'image',
        order_index: 0,
      },
    ],
  },
  {
    id: 'c4',
    title: 'AI-Powered Drug Discovery',
    description: 'Accelerating pharmaceutical research with AI',
    likes_count: 689,
    dislikes_count: 27,
    spider_chains_count: 41,
    views_count: 7891,
    user_liked: false,
    user_disliked: false,
    media: [
      {
        id: 'mc4',
        media_url: 'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg',
        media_type: 'image',
        order_index: 0,
      },
    ],
  },
  {
    id: 'c5',
    title: 'Wearable Health Tech Integration',
    description: 'Connecting patient data through smart devices',
    likes_count: 534,
    dislikes_count: 19,
    spider_chains_count: 36,
    views_count: 6234,
    user_liked: false,
    user_disliked: false,
    media: [
      {
        id: 'mc5',
        media_url: 'https://images.pexels.com/photos/4386470/pexels-photo-4386470.jpeg',
        media_type: 'image',
        order_index: 0,
      },
    ],
  },
];

export default function PostDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [childPosts, setChildPosts] = useState<Post[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);

  useEffect(() => {
    if (id && DUMMY_POSTS[id]) {
      const postData = DUMMY_POSTS[id];
      setPost(postData);
      setUserLiked(postData.user_liked);
      setUserDisliked(postData.user_disliked);
      setLikesCount(postData.likes_count);
      setDislikesCount(postData.dislikes_count);

      loadInitialChildPosts();
    }
  }, [id]);

  const loadInitialChildPosts = () => {
    const initialPosts = ALL_CHILD_POSTS.slice(0, 3);
    setChildPosts(initialPosts);
    setHasMorePosts(initialPosts.length < ALL_CHILD_POSTS.length);
  };

  const loadMoreChildPosts = () => {
    if (isLoadingMore || !hasMorePosts) return;

    setIsLoadingMore(true);

    setTimeout(() => {
      const currentLength = childPosts.length;
      const nextBatch = ALL_CHILD_POSTS.slice(currentLength, currentLength + 2);

      if (nextBatch.length > 0) {
        setChildPosts([...childPosts, ...nextBatch]);

        if (currentLength + nextBatch.length >= ALL_CHILD_POSTS.length) {
          setHasMorePosts(false);
          setReachedEnd(true);
        }
      } else {
        setHasMorePosts(false);
        setReachedEnd(true);
      }

      setIsLoadingMore(false);
    }, 500);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const contentHeight = contentSize.height;
    const screenHeight = layoutMeasurement.height;

    setShowScrollToTop(scrollY > 300);

    const paddingToBottom = 100;
    if (scrollY + screenHeight >= contentHeight - paddingToBottom) {
      if (hasMorePosts && !isLoadingMore) {
        loadMoreChildPosts();
      }
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleLike = () => {
    if (userLiked) {
      setUserLiked(false);
      setLikesCount(prev => prev - 1);
    } else {
      setUserLiked(true);
      setLikesCount(prev => prev + 1);
      if (userDisliked) {
        setUserDisliked(false);
        setDislikesCount(prev => prev - 1);
      }
    }
  };

  const handleDislike = () => {
    if (userDisliked) {
      setUserDisliked(false);
      setDislikesCount(prev => prev - 1);
    } else {
      setUserDisliked(true);
      setDislikesCount(prev => prev + 1);
      if (userLiked) {
        setUserLiked(false);
        setLikesCount(prev => prev - 1);
      }
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: colors.surface }]}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <X size={24} color={colors.text} strokeWidth={2} />
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.mediaContainer}>
          <MediaCarousel
            media={post.media}
            width={width}
            height={height * 0.6}
            showIndicators={post.media.length > 1}
            borderRadius={0}
          />

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: userLiked ? colors.primary : colors.surface },
              ]}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <ThumbsUp
                size={20}
                color={userLiked ? (theme === 'dark' ? colors.background : '#FFFFFF') : colors.text}
                strokeWidth={2}
                fill={userLiked ? (theme === 'dark' ? colors.background : '#FFFFFF') : 'none'}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: userLiked ? (theme === 'dark' ? colors.background : '#FFFFFF') : colors.text },
                ]}
              >
                {formatCount(likesCount)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: userDisliked ? colors.primary : colors.surface },
              ]}
              onPress={handleDislike}
              activeOpacity={0.7}
            >
              <ThumbsDown
                size={20}
                color={userDisliked ? (theme === 'dark' ? colors.background : '#FFFFFF') : colors.text}
                strokeWidth={2}
                fill={userDisliked ? (theme === 'dark' ? colors.background : '#FFFFFF') : 'none'}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: userDisliked ? (theme === 'dark' ? colors.background : '#FFFFFF') : colors.text },
                ]}
              >
                {formatCount(dislikesCount)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.contentSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
          {post.description && (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {post.description}
            </Text>
          )}

          <View style={styles.stats}>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {formatCount(post.views_count)} views
            </Text>
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {formatCount(post.spider_chains_count)} intent chains
            </Text>
          </View>

          {post.spider_chains_count > 0 && (
            <View style={styles.intentChainContainer}>
              <Text style={[styles.intentChainTitle, { color: colors.text }]}>
                Intent Chain Responses
              </Text>
              {childPosts.map((childPost) => (
                <TouchableOpacity
                  key={childPost.id}
                  style={[styles.childPostCard, { backgroundColor: colors.surface }]}
                  activeOpacity={0.8}
                >
                  <View style={styles.childPostMedia}>
                    <MediaCarousel
                      media={childPost.media}
                      width={120}
                      height={120}
                      showIndicators={false}
                      borderRadius={12}
                    />
                  </View>
                  <View style={styles.childPostInfo}>
                    <Text style={[styles.childPostTitle, { color: colors.text }]} numberOfLines={2}>
                      {childPost.title}
                    </Text>
                    {childPost.description && (
                      <Text
                        style={[styles.childPostDescription, { color: colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {childPost.description}
                      </Text>
                    )}
                    <View style={styles.childPostStats}>
                      <View style={styles.childPostStat}>
                        <ThumbsUp size={12} color={colors.textSecondary} strokeWidth={2} />
                        <Text style={[styles.childPostStatText, { color: colors.textSecondary }]}>
                          {formatCount(childPost.likes_count)}
                        </Text>
                      </View>
                      <View style={styles.childPostStat}>
                        <ThumbsDown size={12} color={colors.textSecondary} strokeWidth={2} />
                        <Text style={[styles.childPostStatText, { color: colors.textSecondary }]}>
                          {formatCount(childPost.dislikes_count)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {isLoadingMore && (
                <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading more...
                  </Text>
                </View>
              )}

              {reachedEnd && (
                <View style={[styles.endMessageContainer, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.endMessageText, { color: colors.text }]}>
                    You have reached the end for this chain
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {showScrollToTop && (
        <TouchableOpacity
          style={[styles.scrollToTopButton, { backgroundColor: colors.primary }]}
          onPress={scrollToTop}
          activeOpacity={0.8}
        >
          <ArrowUp size={24} color={theme === 'dark' ? colors.background : '#FFFFFF'} strokeWidth={2} />
          <Text style={[styles.scrollToTopText, { color: theme === 'dark' ? colors.background : '#FFFFFF' }]}>
            Scroll to Top
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mediaContainer: {
    position: 'relative',
  },
  actionButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  contentSection: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 32,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  intentChainContainer: {
    gap: 16,
  },
  intentChainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  childPostCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  childPostMedia: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  childPostInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  childPostTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  childPostDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  childPostStats: {
    flexDirection: 'row',
    gap: 12,
  },
  childPostStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  childPostStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  endMessageContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginTop: 8,
  },
  endMessageText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  scrollToTopButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollToTopText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 100,
  },
});
