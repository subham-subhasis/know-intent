import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, ThumbsUp, MessageCircle, GitBranch } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

type NotificationType = 'like' | 'comment' | 'intent_chain' | 'follow' | 'mention';
type FilterType = 'all' | 'intent_gains' | 'replies';

interface Notification {
  id: string;
  type: NotificationType;
  username: string;
  userAvatar: string;
  message: string;
  timestamp: string;
  postId: string;
  isRead: boolean;
}

const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    username: 'Sarah Chen',
    userAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    message: 'liked your post "The Future of AI in Healthcare"',
    timestamp: '2m ago',
    postId: '1',
    isRead: false,
  },
  {
    id: '2',
    type: 'intent_chain',
    username: 'Marcus Webb',
    userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    message: 'added an intent chain to your post about AI Ethics',
    timestamp: '15m ago',
    postId: '1',
    isRead: false,
  },
  {
    id: '3',
    type: 'comment',
    username: 'Emily Rodriguez',
    userAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
    message: 'replied to your post "Sustainable Living Tips"',
    timestamp: '1h ago',
    postId: '2',
    isRead: false,
  },
  {
    id: '4',
    type: 'like',
    username: 'David Kim',
    userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    message: 'liked your post "Mastering React Native"',
    timestamp: '2h ago',
    postId: '3',
    isRead: true,
  },
  {
    id: '5',
    type: 'intent_chain',
    username: 'Priya Sharma',
    userAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    message: 'created an intent chain on "AI in Healthcare"',
    timestamp: '3h ago',
    postId: '1',
    isRead: true,
  },
  {
    id: '6',
    type: 'follow',
    username: 'Alex Thompson',
    userAvatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    message: 'started following you',
    timestamp: '5h ago',
    postId: '',
    isRead: true,
  },
  {
    id: '7',
    type: 'comment',
    username: 'Lisa Anderson',
    userAvatar: 'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=400',
    message: 'commented on your post about Machine Learning',
    timestamp: '6h ago',
    postId: '1',
    isRead: true,
  },
  {
    id: '8',
    type: 'intent_chain',
    username: 'James Wilson',
    userAvatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
    message: 'added an intent chain to your React Native guide',
    timestamp: '1d ago',
    postId: '3',
    isRead: true,
  },
  {
    id: '9',
    type: 'like',
    username: 'Nina Patel',
    userAvatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
    message: 'liked your post "Sustainable Living Tips"',
    timestamp: '1d ago',
    postId: '2',
    isRead: true,
  },
  {
    id: '10',
    type: 'mention',
    username: 'Ryan Foster',
    userAvatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=400',
    message: 'mentioned you in a comment',
    timestamp: '2d ago',
    postId: '1',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  const filterNotifications = (filter: FilterType): Notification[] => {
    switch (filter) {
      case 'intent_gains':
        return DUMMY_NOTIFICATIONS.filter(n => n.type === 'intent_chain');
      case 'replies':
        return DUMMY_NOTIFICATIONS.filter(n => n.type === 'comment');
      case 'all':
      default:
        return DUMMY_NOTIFICATIONS;
    }
  };

  const filteredNotifications = filterNotifications(selectedFilter);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <ThumbsUp size={20} color={colors.primary} strokeWidth={2} fill={colors.primary} />;
      case 'comment':
        return <MessageCircle size={20} color={colors.primary} strokeWidth={2} />;
      case 'intent_chain':
        return <GitBranch size={20} color={colors.primary} strokeWidth={2} />;
      case 'follow':
        return <ThumbsUp size={20} color={colors.primary} strokeWidth={2} />;
      case 'mention':
        return <MessageCircle size={20} color={colors.primary} strokeWidth={2} />;
      default:
        return null;
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.postId) {
      router.push(`/post/${notification.postId}`);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        {
          backgroundColor: item.isRead ? colors.background : colors.surface,
          borderBottomColor: colors.borderLight
        },
      ]}
      activeOpacity={0.7}
      onPress={() => handleNotificationPress(item)}
    >
      <Image
        source={{ uri: item.userAvatar }}
        style={styles.userAvatar}
        resizeMode="cover"
      />

      <View style={styles.notificationContent}>
        <View style={styles.notificationTextContainer}>
          <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>
            {item.username}
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
        <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
          {item.timestamp}
        </Text>
      </View>

      <View style={styles.iconContainer}>
        {getNotificationIcon(item.type)}
      </View>

      {!item.isRead && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );

  const renderFilterChip = (label: string, filterType: FilterType) => (
    <TouchableOpacity
      key={filterType}
      style={[
        styles.filterChip,
        selectedFilter === filterType
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      activeOpacity={0.7}
      onPress={() => setSelectedFilter(filterType)}
    >
      <Text
        style={[
          styles.filterChipText,
          selectedFilter === filterType
            ? { color: theme === 'dark' ? colors.background : '#FFFFFF', fontWeight: '700' }
            : { color: colors.text, fontWeight: '600' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ChevronLeft size={28} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterContainer, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}
        contentContainerStyle={styles.filterContent}
      >
        {renderFilterChip('All', 'all')}
        {renderFilterChip('My Intent Gains', 'intent_gains')}
        {renderFilterChip('Reply On Post', 'replies')}
      </ScrollView>

      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsContent}
        showsVerticalScrollIndicator={false}
      />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerPlaceholder: {
    width: 40,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    height: 15,
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 16,
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
    position: 'relative',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTextContainer: {
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadDot: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1F2937',
  },
});
