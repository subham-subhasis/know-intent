import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Grid3x3, Network, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import GridView from '@/components/GridView';
import SpiderWebView from '@/components/SpiderWebView';
import { UploadModal } from '@/components/UploadModal';

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

const DUMMY_POSTS: Post[] = [
  {
    id: '1',
    title: 'The Future of AI in Healthcare',
    description: 'Exploring how artificial intelligence is revolutionizing medical diagnostics',
    likes_count: 1243,
    dislikes_count: 45,
    spider_chains_count: 87,
    views_count: 15420,
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
  {
    id: '2',
    title: 'Sustainable Living Tips',
    description: 'Simple ways to reduce your carbon footprint',
    likes_count: 892,
    dislikes_count: 23,
    spider_chains_count: 54,
    views_count: 9845,
    media: [
      {
        id: 'm3',
        media_url: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg',
        media_type: 'image',
        order_index: 0,
      },
    ],
  },
  {
    id: '3',
    title: 'Mastering React Native',
    description: 'Advanced patterns and best practices for mobile development',
    likes_count: 2156,
    dislikes_count: 67,
    spider_chains_count: 143,
    views_count: 28934,
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
  {
    id: '4',
    title: 'Morning Workout Routine',
    description: 'Start your day with energy and focus',
    likes_count: 645,
    dislikes_count: 18,
    spider_chains_count: 32,
    views_count: 7234,
    media: [
      {
        id: 'm7',
        media_url: 'https://images.pexels.com/photos/416778/pexels-photo-416778.jpeg',
        media_type: 'image',
        order_index: 0,
      },
    ],
  },
  {
    id: '5',
    title: 'Urban Photography Guide',
    description: 'Capturing the essence of city life',
    likes_count: 1567,
    dislikes_count: 42,
    spider_chains_count: 98,
    views_count: 19842,
    media: [
      {
        id: 'm8',
        media_url: 'https://images.pexels.com/photos/2246476/pexels-photo-2246476.jpeg',
        media_type: 'image',
        order_index: 0,
      },
      {
        id: 'm9',
        media_url: 'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg',
        media_type: 'image',
        order_index: 1,
      },
    ],
  },
  {
    id: '6',
    title: 'Plant-Based Recipes',
    description: 'Delicious and nutritious vegan meals',
    likes_count: 934,
    dislikes_count: 28,
    spider_chains_count: 61,
    views_count: 11234,
    media: [
      {
        id: 'm10',
        media_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
        media_type: 'image',
        order_index: 0,
      },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [posts, setPosts] = useState<Post[]>(DUMMY_POSTS);
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const loadChildPosts = async (postId: string, childPage: number): Promise<Post[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const childPosts: Post[] = [
      {
        id: `${postId}-child-1`,
        title: 'Detailed Analysis and Deep Dive',
        description: 'Exploring the nuances and key insights',
        likes_count: Math.floor(Math.random() * 2000) + 500,
        dislikes_count: Math.floor(Math.random() * 100) + 10,
        spider_chains_count: Math.floor(Math.random() * 50) + 5,
        views_count: Math.floor(Math.random() * 10000) + 1000,
        media: [
          {
            id: `${postId}-child-media-1`,
            media_url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
            media_type: 'image' as const,
            order_index: 0,
          },
        ],
      },
      {
        id: `${postId}-child-2`,
        title: 'Practical Applications',
        description: 'Real-world implementation strategies',
        likes_count: Math.floor(Math.random() * 1500) + 300,
        dislikes_count: Math.floor(Math.random() * 80) + 5,
        spider_chains_count: Math.floor(Math.random() * 40) + 3,
        views_count: Math.floor(Math.random() * 8000) + 800,
        media: [
          {
            id: `${postId}-child-media-2`,
            media_url: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
            media_type: 'image' as const,
            order_index: 0,
          },
        ],
      },
      {
        id: `${postId}-child-3`,
        title: 'Advanced Techniques',
        description: 'Expert-level tips and tricks',
        likes_count: Math.floor(Math.random() * 3000) + 1000,
        dislikes_count: Math.floor(Math.random() * 120) + 20,
        spider_chains_count: Math.floor(Math.random() * 80) + 10,
        views_count: Math.floor(Math.random() * 15000) + 2000,
        media: [
          {
            id: `${postId}-child-media-3`,
            media_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
            media_type: 'image' as const,
            order_index: 0,
          },
        ],
      },
    ];

    return childPosts;
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  const handleViewAllChains = (postId: string) => {
    router.push(`/post/${postId}`);
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
        <View style={styles.headerContent}>
          <View style={styles.leftSection}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.avatarText, { color: theme === 'dark' ? colors.background : '#FFFFFF' }]}>
                S
              </Text>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>Subham</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>{posts.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>{formatCount(totalViews)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Views</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>{formatCount(totalChains)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Intent Tree</Text>
            </View>
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
            color={viewMode === 'grid' ? (theme === 'dark' ? colors.background : '#FFFFFF') : colors.textSecondary}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.viewModeText,
              { color: viewMode === 'grid' ? (theme === 'dark' ? colors.background : '#FFFFFF') : colors.textSecondary },
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
            color={viewMode === 'spider' ? (theme === 'dark' ? colors.background : '#FFFFFF') : colors.textSecondary}
            strokeWidth={2}
          />
          <Text
            style={[
              styles.viewModeText,
              { color: viewMode === 'spider' ? (theme === 'dark' ? colors.background : '#FFFFFF') : colors.textSecondary },
            ]}
          >
            Intent Tree
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {viewMode === 'grid' ? (
          <GridView
            posts={posts}
            onPostPress={handlePostPress}
            isLoading={isLoading}
          />
        ) : (
          <SpiderWebView
            posts={posts}
            onPostPress={handlePostPress}
            onViewAllChains={handleViewAllChains}
            onLoadChildPosts={loadChildPosts}
            isLoading={isLoading}
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowUploadModal(true)}
        activeOpacity={0.8}
      >
        <Plus size={28} color={theme === 'dark' ? colors.background : '#FFFFFF'} strokeWidth={2.5} />
      </TouchableOpacity>

      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <UploadModal onClose={() => setShowUploadModal(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
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
  floatingButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
