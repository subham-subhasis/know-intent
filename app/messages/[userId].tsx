import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Send, Heart, MoreHorizontal, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { EdgeSwipeBack } from '@/components/EdgeSwipeBack';
import { sessionStorage } from '@/lib/sessionStorage';
import { useChatStore, ChatMessage } from '@/hooks/useChatStore';
import { useChatEngine } from '@/hooks/useChatEngine';

const { height } = Dimensions.get('window');

interface UserProfile {
  userId: string;
  username: string;
  profileImage: string;
}

const USER_PROFILES: Record<string, UserProfile> = {
  user1: {
    userId: 'user1',
    username: 'Sarah Chen',
    profileImage: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  user2: {
    userId: 'user2',
    username: 'Marcus Webb',
    profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  user3: {
    userId: 'user3',
    username: 'Emily Rodriguez',
    profileImage: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  user4: {
    userId: 'user4',
    username: 'David Kim',
    profileImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  user5: {
    userId: 'user5',
    username: 'Priya Sharma',
    profileImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  user6: {
    userId: 'user6',
    username: 'Alex Thompson',
    profileImage: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
};

// Client-to-Server user mapping helpers for local mock parity
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

export default function ChatConversationScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const typingTimeoutRef = useRef<any>(null);
  const lastTapRef = useRef<{ messageId: string; time: number } | null>(null);

  const recipientProfile = USER_PROFILES[userId || 'user1'];

  // 1. Fetch Auth Session info
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await sessionStorage.getSession();
        if (session) {
          setCurrentUserId(session.id);
        } else {
          // Fallback user ID for local preview
          setCurrentUserId('user1');
        }
      } catch (err) {
        console.error('Failed fetching user session:', err);
        setCurrentUserId('user1');
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, []);

  const loggedInId = currentUserId || 'user1';
  const targetRoomId = getConversationId(loggedInId, userId || 'user1');

  // 2. Instantiate Socket Lifecycle Hook
  const { sendMessage, sendTyping, sendSeen, sendUnsend, sendReaction } = useChatEngine(targetRoomId, loggedInId);

  // 3. Connect store reactive slices
  const messages = useChatStore((state) => state.messagesByConversation[targetRoomId] || []);
  const presence = useChatStore((state) => state.presence);
  const typingStates = useChatStore((state) => state.typingStates[targetRoomId] || {});

  const isOnline = presence[mapToBackendId(userId || 'user1')] || false;
  const isRecipientTyping = typingStates[mapToBackendId(userId || 'user1')] || false;

  useEffect(() => {
    // Scroll to end when new messages arrive
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // Handle typing indicator emissions
  const handleInputChange = (text: string) => {
    setInputText(text);

    // Emit true on first keystroke
    if (text.length > 0 && inputText.length === 0) {
      sendTyping(true);
    } else if (text.length === 0) {
      sendTyping(false);
    }

    // Reset typing delay
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (inputText.trim().length === 0) return;
    sendMessage(inputText.trim());
    setInputText('');
    sendTyping(false);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Seen watermarks formatting
  const renderSeenReceipt = (msg: ChatMessage, index: number) => {
    const isLatestSent = msg.senderId === loggedInId && index === messages.length - 1;
    if (!isLatestSent) return null;

    const otherSeen = msg.seenBy.find(s => s.userId === mapToBackendId(userId || 'user1'));
    if (!otherSeen) return null;

    const formattedTime = new Date(otherSeen.seenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return (
      <Text style={[styles.seenText, { color: colors.textTertiary }]}>
        Seen at {formattedTime}
      </Text>
    );
  };

  // Heart Reaction toggle (Instagram-style double tap)
  const handleBubblePress = (msg: ChatMessage) => {
    if (msg.status === 'unsent') return;
    
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (lastTapRef.current && lastTapRef.current.messageId === msg.messageId && (now - lastTapRef.current.time) < DOUBLE_TAP_DELAY) {
      // Toggle heart reaction
      sendReaction(msg.messageId, msg.timestamp, '❤️');
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { messageId: msg.messageId, time: now };
    }
  };

  // Unsend long-press menu
  const handleBubbleLongPress = (msg: ChatMessage) => {
    if (msg.status === 'unsent') return;

    if (msg.senderId === loggedInId) {
      Alert.alert(
        'Message Options',
        'Would you like to unsend this message?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unsend Message',
            style: 'destructive',
            onPress: () => sendUnsend(msg.messageId, msg.timestamp)
          }
        ]
      );
    } else {
      // Allow recipient to react
      Alert.alert(
        'React to message',
        'Choose a reaction emoji',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: '❤️ Love', onPress: () => sendReaction(msg.messageId, msg.timestamp, '❤️') },
          { text: '👍 Like', onPress: () => sendReaction(msg.messageId, msg.timestamp, '👍') },
          { text: '🔥 Fire', onPress: () => sendReaction(msg.messageId, msg.timestamp, '🔥') }
        ]
      );
    }
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMe = item.senderId === loggedInId;
    const isUnsent = item.status === 'unsent';

    return (
      <View style={[styles.messageWrapper, isMe ? styles.sentWrapper : styles.receivedWrapper]}>
        <View style={[styles.messageContainer, isMe ? styles.sentMessageContainer : styles.receivedMessageContainer]}>
          {!isMe && (
            <Image
              source={{ uri: recipientProfile?.profileImage }}
              style={styles.messageAvatar}
              resizeMode="cover"
            />
          )}
          
          <View style={styles.bubbleCol}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleBubblePress(item)}
              onLongPress={() => handleBubbleLongPress(item)}
              style={[
                styles.messageBubble,
                isMe
                  ? { backgroundColor: isUnsent ? 'transparent' : colors.primary }
                  : { backgroundColor: isUnsent ? 'transparent' : colors.surface },
                isUnsent && { borderWidth: 1, borderColor: colors.borderLight, borderStyle: 'dashed' }
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isUnsent && { fontStyle: 'italic', color: colors.textTertiary },
                  !isUnsent && { color: isMe ? (theme === 'dark' ? colors.background : '#FFFFFF') : colors.text }
                ]}
              >
                {item.messageText}
              </Text>
              
              {!isUnsent && (
                <Text
                  style={[
                    styles.messageTimestamp,
                    { color: isMe ? (theme === 'dark' ? colors.textTertiary : 'rgba(255, 255, 255, 0.7)') : colors.textTertiary },
                  ]}
                >
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </TouchableOpacity>

            {/* Render Reactions list */}
            {!isUnsent && item.reactions.length > 0 && (
              <View style={[styles.reactionsRow, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                {item.reactions.map((r, i) => (
                  <Text key={i} style={styles.reactionEmoji}>
                    {r.emoji}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
        {renderSeenReceipt(item, index)}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!recipientProfile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>User not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <EdgeSwipeBack onBack={() => router.back()} />
      
      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ChevronLeft size={28} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: recipientProfile.profileImage }}
              style={styles.headerAvatar}
              resizeMode="cover"
            />
            {isOnline && (
              <View style={[styles.headerOnlineBadge, { backgroundColor: colors.background }]}>
                <View style={styles.greenCircle} />
              </View>
            )}
          </View>
          <View style={styles.headerTitleCol}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{recipientProfile.username}</Text>
            {isRecipientTyping ? (
              <Text style={styles.typingSubtext}>typing...</Text>
            ) : (
              <Text style={[styles.presenceSubtext, { color: colors.textTertiary }]}>
                {isOnline ? 'Active now' : 'offline'}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Messages Feed */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.messageId}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input container */}
      <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.borderLight }]}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.borderLight },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          value={inputText}
          onChangeText={handleInputChange}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: inputText.trim().length > 0 ? colors.primary : colors.surface },
          ]}
          activeOpacity={0.7}
          onPress={handleSend}
          disabled={inputText.trim().length === 0}
        >
          <Send
            size={20}
            color={inputText.trim().length > 0 ? (theme === 'dark' ? colors.background : '#FFFFFF') : colors.textTertiary}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
  },
  headerOnlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  headerTitleCol: {
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  presenceSubtext: {
    fontSize: 11,
    fontWeight: '500',
  },
  typingSubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  headerPlaceholder: {
    width: 40,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  sentWrapper: {
    alignItems: 'flex-end',
  },
  receivedWrapper: {
    alignItems: 'flex-start',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  sentMessageContainer: {
    justifyContent: 'flex-end',
  },
  receivedMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  bubbleCol: {
    alignItems: 'flex-start',
    position: 'relative',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  messageText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 4,
  },
  messageTimestamp: {
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'right',
  },
  seenText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    marginRight: 4,
  },
  reactionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    position: 'absolute',
    bottom: -10,
    right: 12,
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 100,
  },
});
