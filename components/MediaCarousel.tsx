import { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Media {
  id: string;
  media_url: string;
  media_type: 'image' | 'video';
  order_index: number;
}

interface MediaCarouselProps {
  media: Media[];
  width?: number;
  height?: number;
  showIndicators?: boolean;
  borderRadius?: number;
}

export default function MediaCarousel({
  media,
  width: customWidth = width - 32,
  height: customHeight = 200,
  showIndicators = true,
  borderRadius = 16,
}: MediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  if (!media || media.length === 0) {
    return (
      <View style={[styles.placeholder, { width: customWidth, height: customHeight, borderRadius }]}>
        <LinearGradient
          colors={['#9CA3AF', '#6B7280']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.placeholderGradient}
        />
      </View>
    );
  }

  const sortedMedia = [...media].sort((a, b) => a.order_index - b.order_index);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / customWidth);
    setActiveIndex(index);
  };

  return (
    <View style={[styles.container, { width: customWidth, height: customHeight }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {sortedMedia.map((item) => (
          <View key={item.id} style={[styles.mediaContainer, { width: customWidth, height: customHeight }]}>
            {item.media_type === 'image' ? (
              <Image
                source={{ uri: item.media_url }}
                style={[styles.media, { borderRadius }]}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.videoPlaceholder, { borderRadius }]}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.videoGradient}
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {showIndicators && sortedMedia.length > 1 && (
        <View style={styles.indicatorContainer}>
          {sortedMedia.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                scrollViewRef.current?.scrollTo({ x: index * customWidth, animated: true });
                setActiveIndex(index);
              }}
            >
              <View
                style={[
                  styles.indicator,
                  index === activeIndex ? styles.indicatorActive : styles.indicatorInactive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  mediaContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    overflow: 'hidden',
  },
  placeholderGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  videoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  indicatorInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});
