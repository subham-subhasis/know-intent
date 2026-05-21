import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Circle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { EdgeSwipeBack } from '@/components/EdgeSwipeBack';
import { sessionStorage } from '@/lib/sessionStorage';
import { useChatStore, ChatMessage, Conversation } from '@/hooks/useChatStore';
import { useChatEngine } from '@/hooks/useChatEngine';

interface DisplayConversation {
  id: string;
  userId: string;
  username: string;
  profileImage: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

const DUMMY_CONVERSATIONS = [
  {
    id: '1',
    userId: 'user1',
    username: 'Sarah Chen',
    profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
    lastMessage: 'That AI article you shared was really insightful! Would love to discuss more...',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    userId: 'user2',
    username: 'Marcus Webb',
    profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
    lastMessage: 'Thanks for the recommendation! Just finished watching it.',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '3',
    userId: 'user3',
    username: 'Emily Rodriguez',
    profileImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
    lastMessage: 'Hey! Did you see the latest post about machine learning?',
    unreadCount: 1,
    isOnline: false,
  },
  {
    id: '4',
    userId: 'user4',
    username: 'David Kim',
    profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    lastMessage: 'Great content as always! Keep it up 👍',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '5',
    userId: 'user5',
    username: 'Priya Sharma',
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
    lastMessage: 'Can you share the link to that research paper you mentioned?',
    unreadCount: 3,
    isOnline: true,
  },
  {
    id: '6',
    userId: 'user6',
    username: 'Alex Thompson',
    profileImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    lastMessage: 'Looking forward to your next post!',
    unreadCount: 0,
    isOnline: false,
  },
];

// Backend mappings
const mapToBackendId = (id: string) => {
  if (id === 'user1') return 'usr_alice';
  if (id === 'user2') return 'usr_bob';
  if (id === 'user3') return 'usr_charlie';
  return id;
};

const mapToClientId = (id: string) => {
  if (id === 'usr_alice') return 'user1';
  if (id === 'usr_bob') return 'user2';
  if (id === 'usr_charlie') return 'user3';
  return id;
};

const getConversationId = (uid1: string, uid2: string) => {
  const b1 = mapToBackendId(uid1).replace('usr_', '');
  const b2 = mapToBackendId(uid2).replace('usr_', '');
  const sorted = [b1, b2].sort();
  return `conv_direct_${sorted[0]}_${sorted[1]}`;
};

export default function MessagesListScreen() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Session Info
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await sessionStorage.getSession();
        const loggedInId = session?.id || 'user1';
        setCurrentUserId(loggedInId);

        // Seed conversations store if empty
        const storeConversations = useChatStore.getState().conversations;
        if (storeConversations.length === 0) {
          const mapped = DUMMY_CONVERSATIONS.map((c) => {
            const convId = getConversationId(loggedInId, c.userId);
            const initialMsg: ChatMessage = {
              messageId: `msg_init_${c.id}`,
              conversationId: convId,
              senderId: c.userId,
              senderName: c.username,
              messageText: c.lastMessage,
              mediaUrl: null,
              timestamp: Date.now() - 3600000 * 3, // mock 3 hours ago
              reactions: [],
              seenBy: [],
              status: 'sent'
            };

            return {
              id: convId,
              name: c.username,
              isGroup: false,
              avatarUrl: c.profileImage,
              members: [loggedInId, c.userId],
              lastMessage: initialMsg,
              unreadCount: { [loggedInId]: c.unreadCount }
            };
          });

          useChatStore.getState().setConversations(mapped);

          // Seed messages
          mapped.forEach((conv) => {
            if (conv.lastMessage) {
              useChatStore.getState().addMessage(conv.id, conv.lastMessage);
            }
          });
        }
      } catch (err) {
        console.error('Failed loading session in conversation list:', err);
        setCurrentUserId('user1');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const loggedInId = currentUserId || 'user1';

  // 2. Initialize global socket connection on entry
  useChatEngine(undefined, loggedInId);

  // 3. Connect reactive Zustand segments
  const storeConversations = useChatStore((state) => state.conversations);
  const presence = useChatStore((state) => state.presence);

  const displayConversations: DisplayConversation[] = storeConversations.map((c) => {
    const otherMemberId = c.members.find((m) => m !== loggedInId) || 'user2';
    const clientId = mapToClientId(otherMemberId);
    
    // Resolve presence
    const isOnline = presence[mapToBackendId(clientId)] || false;

    // Resolve unread count for current user
    const unreadCount = c.unreadCount ? c.unreadCount[loggedInId] || 0 : 0;

    // Resolve last message details
    const lastMessage = c.lastMessage ? c.lastMessage.messageText : '';
    let lastMessageTime = '';
    
    if (c.lastMessage) {
      const msgDate = new Date(c.lastMessage.timestamp);
      const isToday = msgDate.toDateString() === new Date().toDateString();
      
      if (isToday) {
        lastMessageTime = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        lastMessageTime = msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    }

    return {
      id: c.id,
      userId: clientId,
      username: c.name,
      profileImage: c.avatarUrl || '',
      lastMessage,
      lastMessageTime,
      unreadCount,
      isOnline
    };
  });

  const formatLastMessage = (message: string, maxLength: number = 45) => {
    if (message.length > maxLength) {
      return message.substring(0, maxLength) + '...';
    }
    return message;
  };

  const renderConversation = ({ item }: { item: DisplayConversation }) => (
    <TouchableOpacity
      style={[styles.conversationCard, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}
      activeOpacity={0.7}
      onPress={() => router.push(`/messages/${item.userId}`)}
    >
      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: item.profileImage }}
          style={styles.profileImage}
          resizeMode="cover"
        />
        {item.isOnline && (
          <View style={[styles.onlineIndicator, { backgroundColor: colors.background }]}>
            <Circle size={10} color="#10B981" fill="#10B981" />
          </View>
        )}
      </View>

      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.username, { color: colors.text }]} numberOfLines={1}>
            {item.username}
          </Text>
          <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
            {item.lastMessageTime}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              { color: item.unreadCount > 0 ? colors.text : colors.textSecondary },
              item.unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {formatLastMessage(item.lastMessage)}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.unreadCount, { color: theme === 'dark' ? colors.background : '#FFFFFF' }]}>
                {item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <EdgeSwipeBack onBack={() => router.back()} />
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ChevronLeft size={28} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <FlatList
        data={displayConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        style={styles.conversationsList}
        contentContainerStyle={styles.conversationsContent}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  conversationsList: {
    flex: 1,
  },
  conversationsContent: {
    paddingBottom: 100,
  },
  conversationCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
