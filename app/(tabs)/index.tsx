import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  BackHandler,
} from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, MessageCircle, Sparkles, ExternalLink, ThumbsUp, ThumbsDown, GitBranch, User } from 'lucide-react-native';
import { ShimmerCard } from '@/components/ShimmerPlaceholder';
import { UploadModal } from '@/components/UploadModal';
import { useRouter } from 'expo-router';
import { Modal } from 'react-native';

const { width, height } = Dimensions.get('window');

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
    likes: 45200,
    dislikes: 320,
    spiderChains: 1240,
  },
  {
    id: '2',
    title: 'Building a Successful Startup',
    creator: 'Business Insider',
    views: '890K',
    duration: '15:30',
    likes: 32100,
    dislikes: 450,
    spiderChains: 890,
  },
  {
    id: '3',
    title: 'Healthy Morning Routines',
    creator: 'Wellness Guide',
    views: '2.1M',
    duration: '8:20',
    likes: 78900,
    dislikes: 210,
    spiderChains: 2340,
  },
  {
    id: '4',
    title: 'The Future of Space Exploration',
    creator: 'Science Today',
    views: '3.5M',
    duration: '20:15',
    likes: 125000,
    dislikes: 890,
    spiderChains: 4560,
  },
  {
    id: '5',
    title: 'Digital Art Masterclass',
    creator: 'Creative Studio',
    views: '650K',
    duration: '25:10',
    likes: 28700,
    dislikes: 180,
    spiderChains: 670,
  },
];

const AD_VARIANTS = [
  {
    gradient: ['#FF6B6B', '#FFE66D', '#4ECDC4'],
    brand: 'TechPro',
    tagline: 'Innovation meets excellence',
  },
  {
    gradient: ['#667eea', '#764ba2', '#f093fb'],
    brand: 'LifeStyle+',
    tagline: 'Elevate your everyday',
  },
  {
    gradient: ['#43e97b', '#38f9d7', '#667eea'],
    brand: 'FutureNow',
    tagline: 'Tomorrow starts today',
  },
];

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [dislikedVideos, setDislikedVideos] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleLike = (videoId: string) => {
    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
        setDislikedVideos(prevDislikes => {
          const newDislikes = new Set(prevDislikes);
          newDislikes.delete(videoId);
          return newDislikes;
        });
      }
      return newSet;
    });
  };

  const handleDislike = (videoId: string) => {
    setDislikedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
        setLikedVideos(prevLikes => {
          const newLikes = new Set(prevLikes);
          newLikes.delete(videoId);
          return newLikes;
        });
      }
      return newSet;
    });
  };

  const handleSpiderChain = (videoId: string) => {
    setExpandedVideoId(prev => prev === videoId ? null : videoId);
  };

  const renderAdSection = (index: number) => {
    const adData = AD_VARIANTS[index % AD_VARIANTS.length];
    return (
      <TouchableOpacity
        key={`ad-${index}`}
        style={styles.adSection}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={adData.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.adGradient}
        >
          <View style={styles.adSparkles}>
            <Sparkles size={16} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
            <Sparkles size={12} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
          </View>
          <View style={styles.adContent}>
            <View style={styles.adTextContainer}>
              <Text style={styles.adBrand}>{adData.brand}</Text>
              <Text style={styles.adTagline}>{adData.tagline}</Text>
            </View>
            <View style={styles.adIconContainer}>
              <ExternalLink size={18} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          </View>
          <View style={styles.adSparklesRight}>
            <Sparkles size={14} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
            <Sparkles size={10} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.appName}>Intent</Text>
          <Text style={styles.tagline}>Scroll. Learn. Inspire.</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Bell size={24} color="#1F2937" strokeWidth={2} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <MessageCircle size={24} color="#1F2937" strokeWidth={2} />
            <View style={styles.chatDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.7}
            onPress={() => router.push('/settings')}
          >
            <User size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
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
        {loading ? (
          <>
            <ShimmerCard />
            <ShimmerCard />
            <ShimmerCard />
          </>
        ) : (
          VIDEO_CARDS.map((video, index) => (
            <View key={video.id}>
              <TouchableOpacity style={styles.videoCard} activeOpacity={0.8}>
                <View style={styles.videoThumbnail}>
                  <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.thumbnailGradient}
                  />
                  <View style={styles.statsOverlay}>
                    <TouchableOpacity
                      style={[
                        styles.statBlock,
                        likedVideos.has(video.id) && styles.statBlockActive,
                      ]}
                      onPress={() => handleLike(video.id)}
                      activeOpacity={0.7}
                    >
                      <ThumbsUp
                        size={12}
                        color="#FFFFFF"
                        strokeWidth={2}
                        fill={likedVideos.has(video.id) ? '#FFFFFF' : 'transparent'}
                      />
                      <Text style={styles.statText}>{formatCount(video.likes)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statBlock,
                        dislikedVideos.has(video.id) && styles.statBlockActive,
                      ]}
                      onPress={() => handleDislike(video.id)}
                      activeOpacity={0.7}
                    >
                      <ThumbsDown
                        size={12}
                        color="#FFFFFF"
                        strokeWidth={2}
                        fill={dislikedVideos.has(video.id) ? '#FFFFFF' : 'transparent'}
                      />
                      <Text style={styles.statText}>{formatCount(video.dislikes)}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.statBlock}
                      onPress={() => handleSpiderChain(video.id)}
                      activeOpacity={0.7}
                    >
                      <GitBranch size={12} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.statText}>{formatCount(video.spiderChains)}</Text>
                    </TouchableOpacity>
                  </View>
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

              {expandedVideoId === video.id && (
                <View style={styles.uploadContainer}>
                  <UploadModal
                    onClose={() => setExpandedVideoId(null)}
                    parentVideoId={video.id}
                  />
                </View>
              )}

              {(index + 1) % 2 === 0 && renderAdSection(index)}
            </View>
          ))
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    position: 'relative',
    padding: 6,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  chatDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
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
    maxHeight: 100,
  },
  storiesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  storyContainer: {
    alignItems: 'center',
    width: 70,
  },
  storyCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    marginBottom: 16,
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
  statsOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  statBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statBlockActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  statText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  uploadContainer: {
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 500,
  },
  durationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  adSection: {
    height: 80,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  adGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'relative',
  },
  adSparkles: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  adSparklesRight: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 6,
  },
  adContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adTextContainer: {
    flex: 1,
  },
  adBrand: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  adTagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
    opacity: 0.95,
    letterSpacing: 0.5,
  },
  adIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
});
