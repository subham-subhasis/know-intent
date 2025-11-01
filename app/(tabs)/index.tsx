import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  BackHandler,
  Image,
  PanResponder,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, MessageCircle, Sparkles, ExternalLink, ThumbsUp, ThumbsDown, GitBranch, User, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ShimmerCard } from '@/components/ShimmerPlaceholder';
import Svg, { Circle } from 'react-native-svg';
import { UploadModal } from '@/components/UploadModal';
import { useRouter } from 'expo-router';
import { Modal } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const STORY_DATA = [
  {
    id: '1',
    name: 'Your Story',
    gradient: ['#667eea', '#764ba2'],
    category: 'trending',
    thumbnail: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2',
    name: 'Tech',
    gradient: ['#f093fb', '#f5576c'],
    category: 'tech',
    thumbnail: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '3',
    name: 'Business',
    gradient: ['#4facfe', '#00f2fe'],
    category: 'business',
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '4',
    name: 'Health',
    gradient: ['#43e97b', '#38f9d7'],
    category: 'health',
    thumbnail: 'https://images.pexels.com/photos/3768593/pexels-photo-3768593.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '5',
    name: 'Science',
    gradient: ['#fa709a', '#fee140'],
    category: 'science',
    thumbnail: 'https://images.pexels.com/photos/2159/flight-sky-earth-space.jpg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '6',
    name: 'Art',
    gradient: ['#30cfd0', '#330867'],
    category: 'art',
    thumbnail: 'https://images.pexels.com/photos/1509582/pexels-photo-1509582.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '7',
    name: 'Music',
    gradient: ['#a8edea', '#fed6e3'],
    category: 'music',
    thumbnail: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8',
    name: 'Sports',
    gradient: ['#ff9a9e', '#fecfef'],
    category: 'sports',
    thumbnail: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
];

const VIDEO_CARDS = [
  {
    id: '1',
    title: 'Understanding Machine Learning Basics',
    creator: 'Tech Explained',
    username: 'techexplained',
    views: '1.2M',
    duration: '12:45',
    postedTime: '2h ago',
    likes: 45200,
    dislikes: 320,
    spiderChains: 1240,
    aspectRatio: '1:1',
    thumbnail: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1080',
  },
  {
    id: '2',
    title: 'Building a Successful Startup',
    creator: 'Business Insider',
    username: 'businessinsider',
    views: '890K',
    duration: '15:30',
    postedTime: '5h ago',
    likes: 32100,
    dislikes: 450,
    spiderChains: 890,
    aspectRatio: '16:9',
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: '3',
    title: 'Healthy Morning Routines',
    creator: 'Wellness Guide',
    username: 'wellnessguide',
    views: '2.1M',
    duration: '8:20',
    postedTime: '1d ago',
    likes: 78900,
    dislikes: 210,
    spiderChains: 2340,
    aspectRatio: '4:5',
    thumbnail: 'https://images.pexels.com/photos/3768593/pexels-photo-3768593.jpeg?auto=compress&cs=tinysrgb&w=1080',
  },
  {
    id: '4',
    title: 'The Future of Space Exploration',
    creator: 'Science Today',
    username: 'sciencetoday',
    views: '3.5M',
    duration: '20:15',
    postedTime: '3d ago',
    likes: 125000,
    dislikes: 890,
    spiderChains: 4560,
    aspectRatio: '1:1',
    thumbnail: 'https://images.pexels.com/photos/2159/flight-sky-earth-space.jpg?auto=compress&cs=tinysrgb&w=1080',
  },
  {
    id: '5',
    title: 'Digital Art Masterclass',
    creator: 'Creative Studio',
    username: 'creativestudio',
    views: '650K',
    duration: '25:10',
    postedTime: '1w ago',
    likes: 28700,
    dislikes: 180,
    spiderChains: 670,
    aspectRatio: '16:9',
    thumbnail: 'https://images.pexels.com/photos/1509582/pexels-photo-1509582.jpeg?auto=compress&cs=tinysrgb&w=1200',
  },
  {
    id: '6',
    title: 'Mindfulness & Meditation',
    creator: 'Zen Master',
    username: 'zenmaster',
    views: '1.5M',
    duration: '10:30',
    postedTime: '4h ago',
    likes: 62000,
    dislikes: 150,
    spiderChains: 1580,
    aspectRatio: '4:5',
    thumbnail: 'https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=1080',
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

const CATEGORY_CONTENT: Record<string, Array<{ id: string; title: string; thumbnail: string }>> = {
  trending: [
    { id: 't1', title: 'AI Revolution in 2025', thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 't2', title: 'Sustainable Architecture', thumbnail: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 't3', title: 'Ocean Conservation', thumbnail: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 't4', title: 'Space Tourism', thumbnail: 'https://images.pexels.com/photos/2159/flight-sky-earth-space.jpg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 't5', title: 'Mental Health Awareness', thumbnail: 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 't6', title: 'Quantum Computing', thumbnail: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 't7', title: 'Urban Farming', thumbnail: 'https://images.pexels.com/photos/1301856/pexels-photo-1301856.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 't8', title: 'Electric Vehicles', thumbnail: 'https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 't9', title: 'Digital Art NFTs', thumbnail: 'https://images.pexels.com/photos/1509582/pexels-photo-1509582.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 't10', title: 'Remote Work Future', thumbnail: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=1080' },
  ],
  tech: [
    { id: 'tech1', title: 'AI & Machine Learning', thumbnail: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'tech2', title: 'Cloud Computing', thumbnail: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'tech3', title: 'Blockchain Technology', thumbnail: 'https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'tech4', title: 'Cybersecurity', thumbnail: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'tech5', title: '5G Networks', thumbnail: 'https://images.pexels.com/photos/4271927/pexels-photo-4271927.jpeg?auto=compress&cs=tinysrgb&w=1080' },
  ],
  business: [
    { id: 'biz1', title: 'Startup Success Stories', thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'biz2', title: 'Marketing Strategies', thumbnail: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'biz3', title: 'Leadership Skills', thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'biz4', title: 'Financial Planning', thumbnail: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'biz5', title: 'Team Building', thumbnail: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1080' },
  ],
  health: [
    { id: 'health1', title: 'Yoga & Meditation', thumbnail: 'https://images.pexels.com/photos/3768593/pexels-photo-3768593.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'health2', title: 'Nutrition Guide', thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'health3', title: 'Fitness Workouts', thumbnail: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'health4', title: 'Mental Wellness', thumbnail: 'https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'health5', title: 'Sleep Quality', thumbnail: 'https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=1080' },
  ],
  science: [
    { id: 'sci1', title: 'Space Exploration', thumbnail: 'https://images.pexels.com/photos/2159/flight-sky-earth-space.jpg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'sci2', title: 'Climate Science', thumbnail: 'https://images.pexels.com/photos/60013/desert-drought-dehydrated-clay-soil-60013.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'sci3', title: 'Biotechnology', thumbnail: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'sci4', title: 'Physics Discoveries', thumbnail: 'https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'sci5', title: 'Marine Biology', thumbnail: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1080' },
  ],
  art: [
    { id: 'art1', title: 'Digital Art', thumbnail: 'https://images.pexels.com/photos/1509582/pexels-photo-1509582.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'art2', title: 'Abstract Painting', thumbnail: 'https://images.pexels.com/photos/1070534/pexels-photo-1070534.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'art3', title: 'Street Art', thumbnail: 'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'art4', title: 'Photography', thumbnail: 'https://images.pexels.com/photos/1303081/pexels-photo-1303081.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'art5', title: 'Sculpture', thumbnail: 'https://images.pexels.com/photos/1191710/pexels-photo-1191710.jpeg?auto=compress&cs=tinysrgb&w=1080' },
  ],
  music: [
    { id: 'music1', title: 'Music Production', thumbnail: 'https://images.pexels.com/photos/1916821/pexels-photo-1916821.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'music2', title: 'Live Concerts', thumbnail: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'music3', title: 'Jazz & Blues', thumbnail: 'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'music4', title: 'Classical Music', thumbnail: 'https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'music5', title: 'Electronic Music', thumbnail: 'https://images.pexels.com/photos/1763067/pexels-photo-1763067.jpeg?auto=compress&cs=tinysrgb&w=1080' },
  ],
  sports: [
    { id: 'sport1', title: 'Football', thumbnail: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'sport2', title: 'Basketball', thumbnail: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'sport3', title: 'Swimming', thumbnail: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'sport4', title: 'Tennis', thumbnail: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=1080' },
    { id: 'sport5', title: 'Cycling', thumbnail: 'https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=1080' },
  ],
};

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [expandedVideoId, setExpandedVideoId] = useState<string | null>(null);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [dislikedVideos, setDislikedVideos] = useState<Set<string>>(new Set());
  const [showTrendingModal, setShowTrendingModal] = useState(false);
  const [hasViewedTrending, setHasViewedTrending] = useState(false);
  const [currentTrendingIndex, setCurrentTrendingIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [currentContent, setCurrentContent] = useState(CATEGORY_CONTENT.trending);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const router = useRouter();
  const { colors, theme } = useTheme();
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx > 50 && currentTrendingIndex > 0) {
          handlePrevious();
        } else if (gestureState.dx < -50 && currentTrendingIndex < currentContent.length - 1) {
          handleNext();
        }
      },
    })
  ).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkViewedStatus = async () => {
      try {
        const viewed = await AsyncStorage.getItem('trending_viewed');
        if (viewed === 'true') {
          setHasViewedTrending(true);
        }
      } catch (error) {
        console.error('Error checking viewed status:', error);
      }
    };
    checkViewedStatus();
  }, []);

  useEffect(() => {
    if (showTrendingModal && !isPaused) {
      setProgress(0);

      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            return 100;
          }
          return prev + (100 / 60);
        });
      }, 100);

      timerRef.current = setTimeout(() => {
        if (currentTrendingIndex < currentContent.length - 1) {
          setCurrentTrendingIndex(prev => prev + 1);
          setProgress(0);
        }
      }, 6000);
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showTrendingModal, currentTrendingIndex, currentContent, isPaused]);

  useEffect(() => {
    if (!showTrendingModal) {
      setProgress(0);
      setIsPaused(false);
    }
  }, [showTrendingModal]);

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

  const handleOpenTrending = async (category: string) => {
    setSelectedCategory(category);
    setCurrentContent(CATEGORY_CONTENT[category]);
    setShowTrendingModal(true);
    setCurrentTrendingIndex(0);
    if (category === 'trending') {
      try {
        await AsyncStorage.setItem('trending_viewed', 'true');
        setHasViewedTrending(true);
      } catch (error) {
        console.error('Error saving viewed status:', error);
      }
    }
  };

  const handleCloseTrending = () => {
    setShowTrendingModal(false);
    setCurrentTrendingIndex(0);
  };

  const handleViewPost = () => {
    const currentPost = currentContent[currentTrendingIndex];
    handleCloseTrending();
    router.push(`/post/${currentPost.id}`);
  };

  const handlePrevious = () => {
    if (currentTrendingIndex > 0) {
      setCurrentTrendingIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentTrendingIndex < currentContent.length - 1) {
      setCurrentTrendingIndex(prev => prev + 1);
      setProgress(0);
    }
  };

  const handlePressIn = () => {
    setIsPaused(true);
  };

  const handlePressOut = () => {
    setIsPaused(false);
  };

  const getAspectRatioHeight = (aspectRatio: string) => {
    const cardWidth = width;
    switch (aspectRatio) {
      case '1:1':
        return cardWidth;
      case '16:9':
        return cardWidth * (9 / 16);
      case '4:5':
        return cardWidth * (5 / 4);
      default:
        return cardWidth * (9 / 16);
    }
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.appName, { color: colors.text }]}>KnowIntent</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Scroll. Learn. Inspire.</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Bell size={24} color={colors.icon} strokeWidth={2} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <MessageCircle size={24} color={colors.icon} strokeWidth={2} />
            <View style={styles.chatDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.profileButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
            onPress={() => router.push('/settings')}
          >
            <User size={20} color={theme === 'dark' ? colors.background : colors.background} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={[styles.storiesSection, { backgroundColor: colors.background }]}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
      >
        {STORY_DATA.map((story, index) => (
          <TouchableOpacity
            key={story.id}
            style={styles.storyContainer}
            activeOpacity={0.7}
            onPress={() => handleOpenTrending(story.category)}
          >
            <View style={styles.storyCircleWrapper}>
              <LinearGradient colors={story.gradient} style={styles.storyCircle}>
                <Image
                  source={{ uri: story.thumbnail }}
                  style={styles.storyThumbnail}
                  resizeMode="cover"
                />
              </LinearGradient>
              {index === 0 && !hasViewedTrending && (
                <View style={styles.redNotificationDot} />
              )}
            </View>
            <Text style={[styles.storyName, { color: colors.text }]} numberOfLines={1}>
              {story.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={[styles.feedSection, { backgroundColor: colors.background }]}
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
              <TouchableOpacity
                style={styles.videoCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/post/${video.id}`)}
              >
                <View style={[styles.videoThumbnail, { height: getAspectRatioHeight(video.aspectRatio) }]}>
                  <Image
                    source={{ uri: video.thumbnail }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
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
                  <View style={styles.postedTimeBadge}>
                    <Text style={styles.postedTimeText}>{video.postedTime}</Text>
                  </View>
                </View>

                <View style={styles.videoInfo}>
                  <Text style={[styles.videoTitle, { color: colors.text }]} numberOfLines={2}>
                    {video.title}
                  </Text>
                  <View style={styles.videoMeta}>
                    <TouchableOpacity onPress={() => router.push(`/user/${video.username}`)} activeOpacity={0.7}>
                      <Text style={[styles.creatorName, { color: colors.primary }]}>{video.creator}</Text>
                    </TouchableOpacity>
                    <Text style={[styles.viewsText, { color: colors.textTertiary }]}>{video.views} views</Text>
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

      <Modal
        visible={showTrendingModal}
        transparent={false}
        animationType="fade"
        onRequestClose={handleCloseTrending}
      >
        <View style={[styles.fullScreenModal, { backgroundColor: colors.background }]}>
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity onPress={handleCloseTrending} style={styles.fullScreenCloseButton}>
              <Text style={styles.fullScreenCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={[styles.fullScreenTitle, { color: colors.text }]}>
              {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} ({currentTrendingIndex + 1}/{currentContent.length})
            </Text>
            <View style={styles.progressCircleContainer}>
              <Svg width="40" height="40" viewBox="0 0 40 40">
                <Circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="3"
                  fill="none"
                />
                <Circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 20 20)"
                />
              </Svg>
            </View>
          </View>

          <TouchableOpacity
            style={styles.fullScreenScrollView}
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            {...panResponder.panHandlers}
          >
            <View style={styles.fullScreenContentContainer}>
              <Image
                source={{ uri: currentContent[currentTrendingIndex].thumbnail }}
                style={styles.fullScreenImage}
                resizeMode="cover"
              />

              <View style={styles.fullScreenOverlay}>
                {currentTrendingIndex > 0 && (
                  <TouchableOpacity
                    style={[styles.arrowButton, styles.leftArrow]}
                    onPress={handlePrevious}
                    activeOpacity={0.7}
                  >
                    <ChevronLeft size={32} color="#FFFFFF" strokeWidth={3} />
                  </TouchableOpacity>
                )}

                {currentTrendingIndex < currentContent.length - 1 && (
                  <TouchableOpacity
                    style={[styles.arrowButton, styles.rightArrow]}
                    onPress={handleNext}
                    activeOpacity={0.7}
                  >
                    <ChevronRight size={32} color="#FFFFFF" strokeWidth={3} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.fullScreenInfo}>
                <Text style={styles.fullScreenPostTitle}>
                  {currentContent[currentTrendingIndex].title}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.fullScreenActions}>
            <TouchableOpacity
              style={[styles.fullScreenButton, { backgroundColor: colors.primary }]}
              onPress={handleViewPost}
              activeOpacity={0.8}
            >
              <Text style={styles.fullScreenButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    maxHeight: 90,
  },
  storiesContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  storyContainer: {
    alignItems: 'center',
    width: 64,
  },
  storyCircleWrapper: {
    position: 'relative',
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
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyThumbnail: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  redNotificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: Platform.OS === 'ios' ? 110 : 90,
  },
  videoCard: {
    marginBottom: 0,
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  videoThumbnail: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  thumbnailImage: {
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
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
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
  postedTimeBadge: {
    position: 'absolute',
    top: 12,
    right: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  postedTimeText: {
    fontSize: 11,
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
    borderRadius: 0,
    marginBottom: 0,
    overflow: 'hidden',
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
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 10,
  },
  fullScreenCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseText: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  fullScreenTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullScreenScrollView: {
    flex: 1,
  },
  fullScreenContentContainer: {
    width: width,
    height: height - (Platform.OS === 'ios' ? 200 : 180),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullScreenImage: {
    width: width,
    height: '100%',
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  arrowButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  leftArrow: {
    marginRight: 'auto',
  },
  rightArrow: {
    marginLeft: 'auto',
  },
  fullScreenInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 12,
  },
  fullScreenPostTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  fullScreenActions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  fullScreenButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fullScreenButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
