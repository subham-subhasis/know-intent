import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const STORY_DATA = [
  { id: '1', name: 'Your Story', gradient: ['#667eea', '#764ba2'] },
  { id: '2', name: 'Tech', gradient: ['#f093fb', '#f5576c'] },
  { id: '3', name: 'Business', gradient: ['#4facfe', '#00f2fe'] },
  { id: '4', name: 'Health', gradient: ['#43e97b', '#38f9d7'] },
  { id: '5', name: 'Science', gradient: ['#fa709a', '#fee140'] },
  { id: '6', name: 'Art', gradient: ['#30cfd0', '#330867'] },
  { id: '7', name: 'Music', gradient: ['#a8edea', '#fed6e3'] },
  { id: '8', name: 'Sports', gradient: ['#ff9a9e', '#fecfef'] },
];

const VIDEO_CARDS = [
  {
    id: '1',
    title: 'Understanding Machine Learning Basics',
    creator: 'Tech Explained',
    views: '1.2M',
    duration: '12:45',
  },
  {
    id: '2',
    title: 'Building a Successful Startup',
    creator: 'Business Insider',
    views: '890K',
    duration: '15:30',
  },
  {
    id: '3',
    title: 'Healthy Morning Routines',
    creator: 'Wellness Guide',
    views: '2.1M',
    duration: '8:20',
  },
  {
    id: '4',
    title: 'The Future of Space Exploration',
    creator: 'Science Today',
    views: '3.5M',
    duration: '20:15',
  },
  {
    id: '5',
    title: 'Digital Art Masterclass',
    creator: 'Creative Studio',
    views: '650K',
    duration: '25:10',
  },
];

export default function HomePage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>Intent</Text>
        <Text style={styles.tagline}>Scroll. Learn. Inspire.</Text>
      </View>

      <ScrollView
        style={styles.storiesSection}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
      >
        {STORY_DATA.map((story) => (
          <TouchableOpacity key={story.id} style={styles.storyContainer} activeOpacity={0.7}>
            <LinearGradient colors={story.gradient} style={styles.storyCircle} />
            <Text style={styles.storyName} numberOfLines={1}>
              {story.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.feedSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      >
        {VIDEO_CARDS.map((video) => (
          <TouchableOpacity key={video.id} style={styles.videoCard} activeOpacity={0.8}>
            <View style={styles.videoThumbnail}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.thumbnailGradient}
              />
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{video.duration}</Text>
              </View>
            </View>

            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {video.title}
              </Text>
              <View style={styles.videoMeta}>
                <Text style={styles.creatorName}>{video.creator}</Text>
                <Text style={styles.viewsText}>{video.views} views</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
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
    paddingBottom: 16,
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
  storiesSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  storiesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  storyContainer: {
    alignItems: 'center',
    width: 70,
  },
  storyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storyName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
  },
  feedSection: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
  },
  videoCard: {
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  thumbnailGradient: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  creatorName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  viewsText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#9CA3AF',
  },
});
