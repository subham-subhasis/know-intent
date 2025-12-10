import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import { Grid3x3, Network, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import GridView from '@/components/GridView';
import SpiderWebView from '@/components/SpiderWebView';
import { UploadModal } from '@/components/UploadModal';
import { sessionStorage } from '@/lib/sessionStorage';

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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().catch(error => {
      console.error('Failed to load user:', error);
    });
  }, []);

  const getCurrentUser = async () => {
    const userData = await sessionStorage.getUser();
    setUser(userData);
    setUserId(userData?.id ?? null);
  };

  const refreshUserDetails = async () => {
    if (!user?.username) return;

    try {
      const { getUserDetails } = await import('@/src/api/userService');
      const result = await getUserDetails(user.username);

      if (result.status === 'success') {
        await sessionStorage.saveUser(result.user);
        setUser(result.user);
      }
    } catch (error) {
      console.error('Failed to refresh user details:', error);
    }
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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.profileSection}
            onPress={refreshUserDetails}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              {user?.profile_pic_url ? (
                <Image
                  source={{ uri: user.profile_pic_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={[styles.avatarText, { color: theme === 'dark' ? colors.background : '#FFFFFF' }]}>
                  {user?.first_name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || 'User'}
              </Text>
              <Text style={[styles.userId, { color: colors.textSecondary }]}>@{user?.username || 'user'}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{formatNumber(posts.length)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.text }]}>{formatNumber(0)}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.viewModeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'grid' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode('grid')}
            activeOpacity={0.7}
          >
            <Grid3x3
              size={20}
              color={viewMode === 'grid' ? '#FFFFFF' : colors.textSecondary}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'grid' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'spider' && { backgroundColor: colors.primary },
            ]}
            onPress={() => setViewMode('spider')}
            activeOpacity={0.7}
          >
            <Network
              size={20}
              color={viewMode === 'spider' ? '#FFFFFF' : colors.textSecondary}
              strokeWidth={2}
            />
            <Text
              style={[
                styles.toggleText,
                { color: viewMode === 'spider' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Intent Chain
            </Text>
          </TouchableOpacity>
        </View>

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
      </ScrollView>

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
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  userId: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  viewModeToggle: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
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
