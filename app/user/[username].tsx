import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Grid3x3, Network, ArrowLeft, UserPlus, UserCheck } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
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
    likes_count: 2341,
    dislikes_count: 67,
    spider_chains_count: 124,
    views_count: 28764,
    media: [
      {
        id: 'm4',
        media_url: 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg',
        media_type: 'image',
        order_index: 0,
      },
    ],
  },
  {
    id: '4',
    title: 'Nutrition and Wellness',
    description: 'Evidence-based nutrition tips for a healthier lifestyle',
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

const USER_DATA: Record<string, { name: string; posts: number; followers: number; following: number }> = {
  techexplained: { name: 'Tech Explained', posts: 156, followers: 45200, following: 324 },
  businessinsider: { name: 'Business Insider', posts: 234, followers: 128000, following: 156 },
  wellnessguide: { name: 'Wellness Guide', posts: 89, followers: 23400, following: 267 },
  sciencetoday: { name: 'Science Today', posts: 178, followers: 67800, following: 412 },
  creativestudio: { name: 'Creative Studio', posts: 312, followers: 98200, following: 589 },
  zenmaster: { name: 'Zen Master', posts: 67, followers: 15600, following: 89 },
};

export default function UserProfilePage() {
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const { colors, theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [posts, setPosts] = useState<Post[]>(DUMMY_POSTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const userData = USER_DATA[username as string] || {
    name: username,
    posts: 0,
    followers: 0,
    following: 0,
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

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>@{username}</Text>
        </View>
        <TouchableOpacity
          style={[styles.followButton, {
            backgroundColor: isFollowing ? colors.border : colors.primary
          }]}
          onPress={handleFollowToggle}
          activeOpacity={0.7}
        >
          {isFollowing ? (
            <UserCheck size={20} color={colors.text} strokeWidth={2} />
          ) : (
            <UserPlus size={20} color="#FFFFFF" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{formatNumber(userData.posts)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Posts</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{formatNumber(userData.followers)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{formatNumber(userData.following)}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
          </View>
        </View>

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
              Spider
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'grid' ? (
          <GridView posts={posts} onPostPress={handlePostPress} />
        ) : (
          <SpiderWebView
            posts={posts}
            onPostPress={handlePostPress}
            onViewAllChains={handleViewAllChains}
            loadChildPosts={loadChildPosts}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  followButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
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
});
