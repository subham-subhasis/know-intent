import { PageData } from '@/hooks/useInfiniteScroll';

export interface Post {
  id: string;
  title: string;
  creator: string;
  username: string;
  views: string;
  duration: string;
  postedTime: string;
  likes: number;
  dislikes: number;
  spiderChains: number;
  aspectRatio: string;
  thumbnail: string;
}

const DUMMY_POSTS: Post[] = [
  {
    id: '1',
    title: 'Understanding Machine Learning Basics',
    creator: 'Tech Explained',
    username: 'techexplained',
    views: '1.2M',
    duration: '00:45',
    postedTime: '2h ago',
    likes: 45200,
    dislikes: 320,
    spiderChains: 1240,
    aspectRatio: '1:1',
    thumbnail: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1080',
  },
  {
    id: '2',
    title: 'The Future of Web Development',
    creator: 'Code Masters',
    username: 'codemasters',
    views: '856K',
    duration: '00:58',
    postedTime: '5h ago',
    likes: 32400,
    dislikes: 180,
    spiderChains: 980,
    aspectRatio: '16:9',
    thumbnail: 'https://images.pexels.com/photos/11035471/pexels-photo-11035471.jpeg?auto=compress&cs=tinysrgb&w=1080',
  },
  {
    id: '3',
    title: 'Sustainable Living Tips',
    creator: 'Eco Warriors',
    username: 'ecowarriors',
    views: '2.1M',
    duration: '00:38',
    postedTime: '1d ago',
    likes: 68900,
    dislikes: 420,
    spiderChains: 2150,
    aspectRatio: '4:3',
    thumbnail: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1080',
  },
];

export async function fetchFeed(cursor?: string): Promise<PageData<Post>> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const pageSize = 10;
  const currentPage = cursor ? parseInt(cursor, 10) : 0;

  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;

  const data = Array.from({ length: pageSize }, (_, i) => {
    const basePost = DUMMY_POSTS[i % DUMMY_POSTS.length];
    return {
      ...basePost,
      id: `${startIndex + i + 1}`,
      title: `${basePost.title} #${startIndex + i + 1}`,
    };
  });

  const hasMore = currentPage < 3;
  const nextCursor = hasMore ? `${currentPage + 1}` : null;

  return {
    data,
    nextCursor,
    hasMore,
  };
}
