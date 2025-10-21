import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThumbsUp, ThumbsDown, GitBranch, Eye } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

const USER_VIDEOS = [
  {
    id: '1',
    title: 'My Machine Learning Journey',
    views: '245K',
    likes: 12300,
    dislikes: 120,
    spiderChains: 450,
    gradient: ['#667eea', '#764ba2'],
    responses: [
      {
        id: '1-1',
        title: 'Response: Building on your ML concepts',
        creator: 'Tech Expert',
        gradient: ['#f093fb', '#f5576c'],
        position: { top: -40, left: 20 },
        responses: [
          {
            id: '1-1-1',
            title: 'Deep dive into neural networks',
            creator: 'AI Researcher',
            gradient: ['#4facfe', '#00f2fe'],
            position: { top: -35, right: 15 },
          },
        ],
      },
      {
        id: '1-2',
        title: 'Alternative approach to ML',
        creator: 'Data Scientist',
        gradient: ['#43e97b', '#38f9d7'],
        position: { top: -40, right: 20 },
      },
    ],
  },
  {
    id: '2',
    title: 'Startup Tips for Beginners',
    views: '180K',
    likes: 8900,
    dislikes: 90,
    spiderChains: 320,
    gradient: ['#fa709a', '#fee140'],
    responses: [
      {
        id: '2-1',
        title: 'Funding strategies explained',
        creator: 'Entrepreneur',
        gradient: ['#30cfd0', '#330867'],
        position: { top: -45, left: 25 },
      },
    ],
  },
  {
    id: '3',
    title: 'Healthy Living Guide',
    views: '512K',
    likes: 28700,
    dislikes: 210,
    spiderChains: 890,
    gradient: ['#a8edea', '#fed6e3'],
    responses: [
      {
        id: '3-1',
        title: 'Nutrition facts breakdown',
        creator: 'Dietitian',
        gradient: ['#ff9a9e', '#fecfef'],
        position: { top: -40, left: 30 },
        responses: [
          {
            id: '3-1-1',
            title: 'Meal planning tips',
            creator: 'Chef',
            gradient: ['#ffecd2', '#fcb69f'],
            position: { top: -35, left: 20 },
          },
        ],
      },
      {
        id: '3-2',
        title: 'Exercise routine complementing this',
        creator: 'Fitness Coach',
        gradient: ['#667eea', '#764ba2'],
        position: { top: -40, right: 30 },
      },
    ],
  },
];

export default function ProfilePage() {
  const { colors, theme } = useTheme();

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const renderSpiderNode = (video: any, depth: number = 0, index: number = 0) => {
    const isRoot = depth === 0;
    const cardWidth = isRoot ? width - 32 : width * 0.6;
    const cardHeight = isRoot ? 200 : 120;

    return (
      <View
        key={video.id}
        style={[
          styles.spiderNode,
          isRoot ? styles.rootNode : styles.responseNode,
          { width: cardWidth },
        ]}
      >
        <TouchableOpacity
          style={[styles.spiderCard, { height: cardHeight }]}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={video.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.spiderCardGradient}
          >
            <View style={styles.spiderCardOverlay}>
              <Text style={[styles.spiderTitle, isRoot && styles.rootTitle]} numberOfLines={2}>
                {video.title}
              </Text>
              {!isRoot && video.creator && (
                <Text style={styles.spiderCreator}>{video.creator}</Text>
              )}
              {isRoot && (
                <View style={styles.rootStats}>
                  <View style={styles.rootStatItem}>
                    <Eye size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.rootStatText}>{video.views}</Text>
                  </View>
                  <View style={styles.rootStatItem}>
                    <ThumbsUp size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.rootStatText}>{formatCount(video.likes)}</Text>
                  </View>
                  <View style={styles.rootStatItem}>
                    <GitBranch size={16} color="#FFFFFF" strokeWidth={2} />
                    <Text style={styles.rootStatText}>{formatCount(video.spiderChains)}</Text>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {video.responses && video.responses.length > 0 && (
          <View style={styles.responsesContainer}>
            {video.responses.map((response: any, idx: number) => (
              <View
                key={response.id}
                style={[
                  styles.responseWrapper,
                  response.position,
                ]}
              >
                <View style={[styles.connectionLine, { backgroundColor: colors.border }]} />
                {renderSpiderNode(response, depth + 1, idx)}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.appName, { color: colors.text }]}>My Profile</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Your content and spider chains</Text>
      </View>

      <ScrollView
        style={[styles.content, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.profileInfo, { borderBottomColor: colors.borderLight }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: theme === 'dark' ? colors.background : colors.background }]}>U</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>User Name</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>{USER_VIDEOS.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Videos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>937K</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Views</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>1.6K</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Spider Chains</Text>
            </View>
          </View>
        </View>

        <View style={styles.spiderSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Spider Chains</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Your videos and the trending responses they've inspired
          </Text>

          {USER_VIDEOS.map((video, index) => (
            <View key={video.id} style={styles.spiderChainContainer}>
              {renderSpiderNode(video)}
            </View>
          ))}
        </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
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
  spiderSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 18,
  },
  spiderChainContainer: {
    marginBottom: 100,
    position: 'relative',
  },
  spiderNode: {
    position: 'relative',
  },
  rootNode: {
    marginBottom: 20,
  },
  responseNode: {
    marginTop: 10,
  },
  spiderCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  spiderCardGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  spiderCardOverlay: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  spiderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rootTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  spiderCreator: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  rootStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  rootStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rootStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  responsesContainer: {
    position: 'relative',
    marginTop: 20,
  },
  responseWrapper: {
    position: 'absolute',
  },
  connectionLine: {
    position: 'absolute',
    top: -20,
    left: '50%',
    width: 2,
    height: 20,
    backgroundColor: '#D1D5DB',
  },
});
