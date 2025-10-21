import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { Search as SearchIcon, TrendingUp, X } from 'lucide-react-native';

const TRENDING_SEARCHES = [
  'Machine Learning',
  'Startup Tips',
  'Healthy Living',
  'Space Exploration',
  'Digital Art',
  'Productivity Hacks',
  'Mental Health',
  'Coding Tutorials',
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>Search</Text>
        <Text style={styles.tagline}>Discover new content</Text>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#6B7280" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos, creators, topics..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <X size={20} color="#6B7280" strokeWidth={2} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#1F2937" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Trending Searches</Text>
          </View>

          <View style={styles.trendingContainer}>
            {TRENDING_SEARCHES.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.trendingChip}
                activeOpacity={0.7}
                onPress={() => setSearchQuery(item)}
              >
                <Text style={styles.trendingText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  trendingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  trendingChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  trendingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
});
