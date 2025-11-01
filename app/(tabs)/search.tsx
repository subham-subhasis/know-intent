import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { useState, useRef } from 'react';
import { Search as SearchIcon, TrendingUp, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const GRID_SPACING = 8;
const GRID_COLUMNS = 3;
const ITEM_WIDTH = (width - (GRID_COLUMNS + 1) * GRID_SPACING) / GRID_COLUMNS;

const TRENDING_SEARCHES = [
  'Machine Learning',
  'Startup Tips',
  'Healthy Living',
  'Space Exploration',
  'Digital Art',
  'Productivity Hacks',
  'Mental Health',
  'Coding Tutorials',
  'Web Development',
  'Photography',
  'Fitness',
  'Cooking',
  'Music Production',
  'Travel Tips',
  'Investment',
  'AI Technology',
  'Entrepreneurship',
  'Meditation',
];

const MOCK_CONTENT = [
  {
    id: '1',
    title: 'Understanding Machine Learning',
    thumbnail: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'video' as const,
    creator: 'Tech Explained',
    tags: ['Machine Learning', 'AI Technology', 'Coding Tutorials'],
  },
  {
    id: '2',
    title: 'Startup Success Stories',
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'image' as const,
    creator: 'Business Insider',
    tags: ['Startup Tips', 'Entrepreneurship', 'Investment'],
  },
  {
    id: '3',
    title: 'Morning Yoga Routine',
    thumbnail: 'https://images.pexels.com/photos/3768593/pexels-photo-3768593.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'video' as const,
    creator: 'Wellness Coach',
    tags: ['Healthy Living', 'Fitness', 'Meditation'],
  },
  {
    id: '4',
    title: 'Space Station Tour',
    thumbnail: 'https://images.pexels.com/photos/2159/flight-sky-earth-space.jpg?auto=compress&cs=tinysrgb&w=400',
    type: 'video' as const,
    creator: 'NASA',
    tags: ['Space Exploration'],
  },
  {
    id: '5',
    title: 'Digital Art Tutorial',
    thumbnail: 'https://images.pexels.com/photos/1509582/pexels-photo-1509582.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'image' as const,
    creator: 'Art Studio',
    tags: ['Digital Art', 'Photography'],
  },
  {
    id: '6',
    title: 'Productivity Tips',
    thumbnail: 'https://images.pexels.com/photos/955395/pexels-photo-955395.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'image' as const,
    creator: 'Life Hacks',
    tags: ['Productivity Hacks'],
  },
  {
    id: '7',
    title: 'Mental Wellness Guide',
    thumbnail: 'https://images.pexels.com/photos/3760610/pexels-photo-3760610.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'video' as const,
    creator: 'Mind Coach',
    tags: ['Mental Health', 'Meditation'],
  },
  {
    id: '8',
    title: 'React Native Tutorial',
    thumbnail: 'https://images.pexels.com/photos/879109/pexels-photo-879109.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'video' as const,
    creator: 'Code Academy',
    tags: ['Coding Tutorials', 'Web Development'],
  },
  {
    id: '9',
    title: 'Travel Photography',
    thumbnail: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: 'image' as const,
    creator: 'Travel Blog',
    tags: ['Photography', 'Travel Tips'],
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { colors } = useTheme();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const trendingScrollRef = useRef<FlatList>(null);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);

  const filteredContent = searchQuery
    ? MOCK_CONTENT.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : MOCK_CONTENT;

  const handleTrendingPress = (search: string) => {
    setSearchQuery(search);
  };

  const handlePostPress = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <Text style={[styles.appName, { color: colors.text }]}>Search</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>Discover new content</Text>
      </View>

      <View style={[styles.searchSection, { backgroundColor: colors.background }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SearchIcon size={20} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search videos, creators, topics..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.trendingSection}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={20} color={colors.text} strokeWidth={2} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Searches</Text>
        </View>

        <FlatList
          ref={trendingScrollRef}
          data={TRENDING_SEARCHES}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trendingScrollContent}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.trendingChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() => handleTrendingPress(item)}
            >
              <Text style={[styles.trendingText, { color: colors.textSecondary }]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={[styles.content, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {searchQuery ? (
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>
              Results for "{searchQuery}"
            </Text>
            <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
              {filteredContent.length} {filteredContent.length === 1 ? 'result' : 'results'}
            </Text>
          </View>
        ) : (
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>Recommended for you</Text>
          </View>
        )}

        <View style={styles.gridContainer}>
          {filteredContent.map((item, index) => {
            const row = Math.floor(index / GRID_COLUMNS);
            const col = index % GRID_COLUMNS;
            const isLastInRow = col === GRID_COLUMNS - 1;
            const isLastRow = row === Math.floor((filteredContent.length - 1) / GRID_COLUMNS);

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.gridItem,
                  { backgroundColor: colors.surface },
                  !isLastInRow && styles.gridItemMargin,
                  !isLastRow && styles.gridItemBottom,
                ]}
                onPress={() => handlePostPress(item.id)}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
                <View style={styles.gridOverlay}>
                  <Text style={styles.gridType}>{item.type === 'video' ? '▶' : '📷'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredContent.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No results found for "{searchQuery}"
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Try searching for something else
            </Text>
          </View>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
  searchSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  trendingSection: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  trendingScrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  trendingChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginRight: 10,
  },
  trendingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GRID_SPACING,
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  gridItemMargin: {
    marginRight: GRID_SPACING,
  },
  gridItemBottom: {
    marginBottom: GRID_SPACING,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gridType: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
