import { create } from 'zustand';

export interface Reaction {
  userId: string;
  username: string;
  emoji: string;
}

export interface ChatMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  messageText: string;
  mediaUrl: string | null;
  mediaType?: 'image' | 'video' | 'audio' | null;
  parentMessageId?: string | null;
  timestamp: number;
  reactions: Reaction[];
  seenBy: { userId: string; seenAt: number }[];
  status: 'sending' | 'sent' | 'failed' | 'unsent';
}

export interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  avatarUrl?: string;
  members: string[];
  lastMessage?: ChatMessage | null;
  unreadCount?: Record<string, number>;
}

export interface ChatState {
  messagesByConversation: Record<string, ChatMessage[]>;
  conversations: Conversation[];
  presence: Record<string, boolean>;
  typingStates: Record<string, Record<string, boolean>>;
  isConnected: boolean;
  
  setConnectionStatus: (connection: boolean) => void;
  setConversations: (conversations: Conversation[]) => void;
  addMessage: (conversationId: string, message: ChatMessage) => void;
  unsendMessage: (conversationId: string, messageId: string) => void;
  updateMessageReactions: (conversationId: string, messageId: string, reactions: Reaction[]) => void;
  updateSeenWatermark: (conversationId: string, userId: string, seenAt: number) => void;
  setPresence: (userId: string, isOnline: boolean) => void;
  setTypingState: (conversationId: string, userId: string, isTyping: boolean) => void;
  clearUnreadCount: (conversationId: string, userId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messagesByConversation: {},
  conversations: [],
  presence: {},
  typingStates: {},
  isConnected: false,

  setConnectionStatus: (connection) => set({ isConnected: connection }),

  setConversations: (conversations) => set({ conversations }),

  addMessage: (conversationId, message) => set((state) => {
    const existing = state.messagesByConversation[conversationId] || [];
    
    // Check if message already exists (e.g. updating optimistic UI from 'sending' to 'sent')
    const exists = existing.some((m) => m.messageId === message.messageId);
    let updatedMessages: ChatMessage[];
    
    if (exists) {
      updatedMessages = existing.map((m) => 
        m.messageId === message.messageId ? message : m
      );
    } else {
      updatedMessages = [...existing, message];
    }

    // Sort messages chronologically to ensure they display in correct order
    updatedMessages.sort((a, b) => a.timestamp - b.timestamp);

    // Update conversation's last message and unread count
    const updatedConversations = state.conversations.map((conv) => {
      if (conv.id === conversationId) {
        const nextUnread = { ...(conv.unreadCount || {}) };
        
        // Only increment if we didn't send the message ourselves, and it's a new message
        if (!exists && message.status === 'sent') {
          conv.members.forEach((membId) => {
            if (membId !== message.senderId) {
              nextUnread[membId] = (nextUnread[membId] || 0) + 1;
            }
          });
        }

        return {
          ...conv,
          lastMessage: message,
          unreadCount: nextUnread,
        };
      }
      return conv;
    });

    return {
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: updatedMessages,
      },
      conversations: updatedConversations,
    };
  }),

  unsendMessage: (conversationId, messageId) => set((state) => {
    const existing = state.messagesByConversation[conversationId] || [];
    const updated = existing.map((m) => 
      m.messageId === messageId 
        ? { 
            ...m, 
            status: 'unsent' as const, 
            messageText: 'This message was unsent', 
            mediaUrl: null 
          } 
        : m
    );

    // Update the conversation's last message if it was the one unsent
    const updatedConversations = state.conversations.map((conv) => {
      if (conv.id === conversationId && conv.lastMessage?.messageId === messageId) {
        return {
          ...conv,
          lastMessage: {
            ...conv.lastMessage,
            status: 'unsent' as const,
            messageText: 'This message was unsent',
            mediaUrl: null
          }
        };
      }
      return conv;
    });

    return {
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: updated,
      },
      conversations: updatedConversations,
    };
  }),

  updateMessageReactions: (conversationId, messageId, reactions) => set((state) => {
    const existing = state.messagesByConversation[conversationId] || [];
    const updated = existing.map((m) => 
      m.messageId === messageId ? { ...m, reactions } : m
    );

    return {
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: updated,
      }
    };
  }),

  updateSeenWatermark: (conversationId, userId, seenAt) => set((state) => {
    const existing = state.messagesByConversation[conversationId] || [];
    
    // Mark seen for any message in this conversation sent before or at seenAt
    const updated = existing.map((m) => {
      if (m.timestamp <= seenAt) {
        const hasSeen = m.seenBy.some((s) => s.userId === userId);
        if (!hasSeen) {
          return {
            ...m,
            seenBy: [...m.seenBy, { userId, seenAt }]
          };
        }
      }
      return m;
    });

    // Reset unread count for this user in conversation list
    const updatedConversations = state.conversations.map((conv) => {
      if (conv.id === conversationId) {
        const nextUnread = { ...(conv.unreadCount || {}) };
        nextUnread[userId] = 0;
        return {
          ...conv,
          unreadCount: nextUnread,
        };
      }
      return conv;
    });

    return {
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: updated,
      },
      conversations: updatedConversations,
    };
  }),

  setPresence: (userId, isOnline) => set((state) => ({
    presence: {
      ...state.presence,
      [userId]: isOnline,
    }
  })),

  setTypingState: (conversationId, userId, isTyping) => set((state) => {
    const currentConvTyping = state.typingStates[conversationId] || {};
    return {
      typingStates: {
        ...state.typingStates,
        [conversationId]: {
          ...currentConvTyping,
          [userId]: isTyping,
        }
      }
    };
  }),

  clearUnreadCount: (conversationId, userId) => set((state) => {
    const updatedConversations = state.conversations.map((conv) => {
      if (conv.id === conversationId) {
        const nextUnread = { ...(conv.unreadCount || {}) };
        nextUnread[userId] = 0;
        return {
          ...conv,
          unreadCount: nextUnread,
        };
      }
      return conv;
    });

    return {
      conversations: updatedConversations,
    };
  }),
}));
