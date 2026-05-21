import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { sessionStorage } from '@/lib/sessionStorage';
import { useChatStore, ChatMessage, Reaction } from './useChatStore';

// Singleton socket instance to avoid redundant connections across screen navigations
let globalSocket: WebSocket | null = null;
let connectionPromise: Promise<WebSocket> | null = null;
const listeners = new Set<(event: any) => void>();

export const useChatEngine = (conversationId?: string, currentUserId?: string) => {
  const socketRef = useRef<WebSocket | null>(null);
  const { addMessage, setConnectionStatus, unsendMessage, updateMessageReactions, updateSeenWatermark, setPresence, setTypingState } = useChatStore();

  useEffect(() => {
    let isMounted = true;
    let typingTimeout: NodeJS.Timeout | null = null;

    const getOrConnectSocket = async (): Promise<WebSocket | null> => {
      if (globalSocket && (globalSocket.readyState === WebSocket.OPEN || globalSocket.readyState === WebSocket.CONNECTING)) {
        return globalSocket;
      }

      if (connectionPromise) {
        return connectionPromise;
      }

      connectionPromise = new Promise(async (resolve, reject) => {
        try {
          const session = await sessionStorage.getSession();
          const userId = currentUserId || session?.id;
          
          if (!userId) {
            reject(new Error('No authenticated user session found.'));
            return;
          }

          const host = process.env.EXPO_PUBLIC_SERVER_HOST || 'localhost:3000';
          // Android Emulator loopback resolution
          const resolvedHost = Platform.OS === 'android' && host.startsWith('localhost')
            ? '10.0.2.2:3000'
            : host;

          const wsUrl = `ws://${resolvedHost}/ws`;
          console.log(`🔌 Initializing Real-time WebSocket connection to: ${wsUrl}`);
          const socket = new WebSocket(wsUrl);

          socket.onopen = () => {
            console.log('✅ Real-time WebSocket connection established successfully.');
            setConnectionStatus(true);
            
            // Send auth packet right after handshake
            socket.send(JSON.stringify({
              type: 'auth',
              data: {
                userId,
                deviceType: Platform.OS,
                token: session?.auth_token || userId
              }
            }));
            
            globalSocket = socket;
            connectionPromise = null;
            resolve(socket);
          };

          socket.onmessage = (e) => {
            try {
              const packet = JSON.parse(e.data);
              const { type, data } = packet;
              
              // Distribute payload to all registered hook listeners
              listeners.forEach((listener) => listener(packet));

              // Process in Zustand Store
              switch (type) {
                case 'new_message': {
                  addMessage(data.conversationId, data);
                  break;
                }
                case 'messages_seen': {
                  updateSeenWatermark(data.conversationId, data.userId, data.seenAt);
                  break;
                }
                case 'reaction_update': {
                  updateMessageReactions(data.conversationId, data.messageId, data.reactions);
                  break;
                }
                case 'unsend_update': {
                  unsendMessage(data.conversationId, data.messageId);
                  break;
                }
                case 'presence_update': {
                  setPresence(data.userId, data.isOnline);
                  break;
                }
                case 'typing_update': {
                  setTypingState(data.conversationId, data.userId, data.isTyping);
                  break;
                }
                case 'error': {
                  console.error('❌ WebSocket server returned error:', data.message);
                  break;
                }
              }
            } catch (err) {
              console.error('❌ Error decoding WebSocket packet:', err);
            }
          };

          socket.onerror = (err) => {
            console.error('❌ WebSocket connection error occurred:', err);
          };

          socket.onclose = (e) => {
            console.log(`🔌 WebSocket connection closed. Code: ${e.code}, Reason: ${e.reason}`);
            setConnectionStatus(false);
            globalSocket = null;
            connectionPromise = null;
          };

        } catch (err) {
          connectionPromise = null;
          reject(err);
        }
      });

      return connectionPromise;
    };

    const init = async () => {
      try {
        const socket = await getOrConnectSocket();
        if (socket && isMounted) {
          socketRef.current = socket;
          
          // Send mark_seen immediately upon entering the chat screen
          if (conversationId && currentUserId) {
            sendSeen();
          }
        }
      } catch (err) {
        console.error('❌ Failed starting WebSocket coordinator:', err);
      }
    };

    // Shared message listener for this active screen hook to intercept room-specific triggers
    const messageListener = (packet: any) => {
      const { type, data } = packet;
      if (conversationId && type === 'new_message' && data.conversationId === conversationId) {
        // Auto-mark seen if we are currently looking at this active conversation
        if (data.senderId !== currentUserId) {
          sendSeen();
        }
      }
    };

    listeners.add(messageListener);
    init();

    return () => {
      isMounted = false;
      listeners.delete(messageListener);
      // Clean up typing states just in case
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [conversationId, currentUserId]);

  const sendSocketMessage = (payload: { type: string; data: any }) => {
    const socket = socketRef.current || globalSocket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
      return true;
    } else {
      console.warn('⚠️ WebSocket not fully connected. Buffering / skipping event send.');
      return false;
    }
  };

  const sendMessage = async (messageText: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio') => {
    if (!conversationId || !currentUserId) return null;

    const user = await sessionStorage.getUser();
    const senderName = user ? `${user.first_name} ${user.last_name}` : currentUserId;
    
    // Create optimistic message to display immediately in UI
    const tempMessageId = `msg_opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const optimisticMessage: ChatMessage = {
      messageId: tempMessageId,
      conversationId,
      senderId: currentUserId,
      senderName,
      messageText,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      timestamp: Date.now(),
      reactions: [],
      seenBy: [{ userId: currentUserId, seenAt: Date.now() }],
      status: 'sending'
    };

    // Render immediately in optimistic UI
    addMessage(conversationId, optimisticMessage);

    // Dispatch over Socket
    const success = sendSocketMessage({
      type: 'send_message',
      data: {
        conversationId,
        senderId: currentUserId,
        senderName,
        messageText,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null
      }
    });

    if (!success) {
      // Mark as failed if socket isn't open
      const failedMessage: ChatMessage = {
        ...optimisticMessage,
        status: 'failed'
      };
      addMessage(conversationId, failedMessage);
    }
    return tempMessageId;
  };

  const sendTyping = (isTyping: boolean) => {
    if (!conversationId || !currentUserId) return;
    sendSocketMessage({
      type: 'typing',
      data: {
        conversationId,
        userId: currentUserId,
        isTyping
      }
    });
  };

  const sendSeen = () => {
    if (!conversationId || !currentUserId) return;
    sendSocketMessage({
      type: 'mark_seen',
      data: {
        conversationId,
        userId: currentUserId
      }
    });
    
    // Optimistically update our own unread count
    useChatStore.getState().clearUnreadCount(conversationId, currentUserId);
  };

  const sendUnsend = (messageId: string, timestamp: number) => {
    if (!conversationId || !currentUserId) return;
    sendSocketMessage({
      type: 'unsend_message',
      data: {
        messageId,
        conversationId,
        timestamp,
        userId: currentUserId
      }
    });
    // Optimistic locally
    unsendMessage(conversationId, messageId);
  };

  const sendReaction = (messageId: string, timestamp: number, emoji: string) => {
    if (!conversationId || !currentUserId) return;
    
    // Optimistic toggle reaction local state
    const existingMessages = useChatStore.getState().messagesByConversation[conversationId] || [];
    const targetMsg = existingMessages.find((m) => m.messageId === messageId);
    
    if (targetMsg) {
      const user = sessionStorage.getUser();
      const displayName = user ? `${(user as any).first_name}` : currentUserId;
      
      const reactions = [...targetMsg.reactions];
      const index = reactions.findIndex((r) => r.userId === currentUserId);
      if (index > -1) {
        if (reactions[index].emoji === emoji) {
          reactions.splice(index, 1);
        } else {
          reactions[index].emoji = emoji;
        }
      } else {
        reactions.push({ userId: currentUserId, username: displayName, emoji });
      }
      
      updateMessageReactions(conversationId, messageId, reactions);
    }

    sendSocketMessage({
      type: 'toggle_reaction',
      data: {
        messageId,
        conversationId,
        timestamp,
        userId: currentUserId,
        username: currentUserId, // Fallback
        emoji
      }
    });
  };

  return {
    sendMessage,
    sendTyping,
    sendSeen,
    sendUnsend,
    sendReaction,
    socket: socketRef.current || globalSocket
  };
};
