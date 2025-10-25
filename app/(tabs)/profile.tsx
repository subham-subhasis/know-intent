import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Grid3x3, Network } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import GridView from '@/components/GridView';
import SpiderWebView from '@/components/SpiderWebView';

type ViewMode = 'grid' | 'spider';

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

export default function ProfilePage() {
  const { colors, theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadPosts();
    }
  }, [userId, page]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const loadPosts = async () => {
    if (!userId || !hasMore) return;

    try {
      setIsLoading(true);
      const pageSize = 20;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          description,
          likes_count,
          dislikes_count,
          spider_chains_count,
          views_count,
          created_at
        `)
        .eq('user_id', userId)
        .is('parent_post_id', null)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (postsError) throw postsError;

      if (!postsData || postsData.length < pageSize) {
        setHasMore(false);
      }

      if (postsData && postsData.length > 0) {
        const postIds = postsData.map(p => p.id);
        const { data: mediaData, error: mediaError } = await supabase
          .from('post_media')
          .select('*')
          .in('post_id', postIds)
          .order('order_index', { ascending: true });

        if (mediaError) throw mediaError;

        const postsWithMedia = postsData.map(post => ({
          ...post,
          media: mediaData?.filter(m => m.post_id === post.id) || [],
        }));

        setPosts(prev => page === 1 ? postsWithMedia : [...prev, ...postsWithMedia]);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChildPosts = async (postId: string, childPage: number): Promise<Post[]> => {
    try {
      const pageSize = 10;
      const from = (childPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data: childPosts, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          description,
          likes_count,
          dislikes_count,
          spider_chains_count,
          views_count
        `)
        .eq('parent_post_id', postId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (postsError) throw postsError;

      if (!childPosts || childPosts.length === 0) return [];

      const childPostIds = childPosts.map(p => p.id);
      const { data: mediaData, error: mediaError } = await supabase
        .from('post_media')
        .select('*')
        .in('post_id', childPostIds)
        .order('order_index', { ascending: true });

      if (mediaError) throw mediaError;

      return childPosts.map(post => ({
        ...post,
        media: mediaData?.filter(m => m.post_id === post.id) || [],
      }));
    } catch (error) {
      console.error('Error loading child posts:', error);
      return [];
    }
  };

  const handleEndReached = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handlePostPress = (postId: string) => {
    console.log('Post pressed:', postId);
  };

  const handleViewAllChains = (postId: string) => {
    console.log('View all chains for post:', postId);
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

  const totalViews = posts.reduce((sum, post) => sum + post.views_count, 0);
  const totalChains = posts.reduce((sum, post) => sum + post.spider_chains_count, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.appName, { color: colors.text }]}>My Profile</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your content and spider chains</Text>
      </View>

      <View style={[styles.profileInfo, { borderBottomColor: colors.borderLight, backgroundColor: colors.background }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.avatarText, { color: theme === 'dark' ? colors.background : colors.background }]}>U</Text>
        </View>
        <Text style={[styles.userName, { color: colors.text }]}>User Name</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.text }]}>{posts.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCount(totalViews)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Views</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.text }]}>{formatCount(totalChains)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Spider Chains</Text>
          </View>
        </View>
      </View>

      <View style={[styles.viewModeContainer, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'grid' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setViewMode('grid')}
        >
          <Grid3x3
            size={20}
            color={viewMode === 'grid' ? '#FFFFFF' : colors.textSecondary}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.viewModeText,
              { color: viewMode === 'grid' ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            Grid
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'spider' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setViewMode('spider')}
        >
          <Network
            size={20}
            color={viewMode === 'spider' ? '#FFFFFF' : colors.textSecondary}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.viewModeText,
              { color: viewMode === 'spider' ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            Spider Web
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {viewMode === 'grid' ? (
          <GridView
            posts={posts}
            onPostPress={handlePostPress}
            onEndReached={handleEndReached}
            isLoading={isLoading}
          />
        ) : (
          <SpiderWebView
            posts={posts}
            onPostPress={handlePostPress}
            onViewAllChains={handleViewAllChains}
            onEndReached={handleEndReached}
            onLoadChildPosts={loadChildPosts}
            isLoading={isLoading}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});
