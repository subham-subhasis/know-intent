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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Send } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { height } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
}

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

const DUMMY_MESSAGES: Record<string, Message[]> = {
  user1: [
    {
      id: '1',
      text: 'Hey! Did you see the new AI research paper?',
      timestamp: '10:30 AM',
      isSent: false,
    },
    {
      id: '2',
      text: 'Yes! It was really fascinating. The approach they took was innovative.',
      timestamp: '10:32 AM',
      isSent: true,
    },
    {
      id: '3',
      text: 'That AI article you shared was really insightful! Would love to discuss more...',
      timestamp: '10:35 AM',
      isSent: false,
    },
  ],
  user2: [
    {
      id: '1',
      text: 'Thanks for recommending that documentary!',
      timestamp: '9:15 AM',
      isSent: false,
    },
    {
      id: '2',
      text: 'No problem! Glad you enjoyed it.',
      timestamp: '9:20 AM',
      isSent: true,
    },
    {
      id: '3',
      text: 'Thanks for the recommendation! Just finished watching it.',
      timestamp: '9:45 AM',
      isSent: false,
    },
  ],
};

export default function ChatConversationScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { colors, theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES[userId || 'user1'] || []);
  const [inputText, setInputText] = useState('');

  const userProfile = USER_PROFILES[userId || 'user1'];

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isSent ? styles.sentMessageContainer : styles.receivedMessageContainer,
      ]}
    >
      {!item.isSent && (
        <Image
          source={{ uri: userProfile?.profileImage }}
          style={styles.messageAvatar}
          resizeMode="cover"
        />
      )}
      <View
        style={[
          styles.messageBubble,
          item.isSent
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.surface },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: item.isSent ? (theme === 'dark' ? colors.background : '#FFFFFF') : colors.text },
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.messageTimestamp,
            { color: item.isSent ? (theme === 'dark' ? colors.textTertiary : 'rgba(255, 255, 255, 0.7)') : colors.textTertiary },
          ]}
        >
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  if (!userProfile) {
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
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ChevronLeft size={28} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image
            source={{ uri: userProfile.profileImage }}
            style={styles.headerAvatar}
            resizeMode="cover"
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>{userProfile.username}</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.borderLight }]}>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.text, borderColor: colors.borderLight },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          value={inputText}
          onChangeText={setInputText}
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
    gap: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
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
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
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
  messageBubble: {
    maxWidth: '75%',
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
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
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
