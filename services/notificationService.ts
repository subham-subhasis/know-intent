import { PageData } from '@/hooks/useInfiniteScroll';

export type NotificationType = 'like' | 'comment' | 'intent_chain' | 'follow' | 'mention';

export interface Notification {
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
];

export async function fetchNotifications(cursor?: string): Promise<PageData<Notification>> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const pageSize = 10;
  const currentPage = cursor ? parseInt(cursor, 10) : 0;

  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;

  const data = Array.from({ length: pageSize }, (_, i) => {
    const baseNotif = DUMMY_NOTIFICATIONS[i % DUMMY_NOTIFICATIONS.length];
    return {
      ...baseNotif,
      id: `${startIndex + i + 1}`,
      message: `${baseNotif.message} #${startIndex + i + 1}`,
    };
  });

  const hasMore = currentPage < 2;
  const nextCursor = hasMore ? `${currentPage + 1}` : null;

  return {
    data,
    nextCursor,
    hasMore,
  };
}
