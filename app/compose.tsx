import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Crop,
  Lightbulb,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Pencil,
  PenSquare,
  Plus,
  Sparkles,
  Tag,
  Upload,
  Video,
  WandSparkles,
  X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useTheme } from '@/contexts/ThemeContext';
import {
  PickedAsset,
  pickImagesFromLibrary,
  pickVideoFromLibrary,
  showImagePickerOptions,
} from '@/lib/imagePicker';

type ComposerMode = 'video' | 'photo' | 'carousel' | 'text';
type ActiveSheet = 'ratio' | 'description' | 'kpis' | 'cover' | 'ai' | 'background' | 'style' | null;
type RatioOption = { key: string; label: string; aspectRatio: number };
type TextStyleOption = {
  id: string;
  label: string;
  fontSize: number;
  fontWeight: '500' | '600' | '700';
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const TEXT_DRAG_INSET = 0;
const TEXT_WRAP_HORIZONTAL_PADDING = 4;
const TEXT_WRAP_VERTICAL_PADDING = 6;
const BACKGROUND_PALETTE_COLORS = ['#FF4D4F', '#F59E0B', '#FDE047', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'] as const;
const TEXT_PALETTE_COLORS = ['#FFFFFF', '#FDE047', '#FB7185', '#8B5CF6', '#3B82F6', '#10B981', '#111827'] as const;

const getContrastText = (hex: string) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return '#FFFFFF';
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.62 ? '#0F172A' : '#FFFFFF';
};

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};

const interpolateHex = (startHex: string, endHex: string, ratio: number) => {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);
  const mix = (from: number, to: number) => Math.round(from + (to - from) * ratio);
  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return `#${toHex(mix(start.r, end.r))}${toHex(mix(start.g, end.g))}${toHex(mix(start.b, end.b))}`.toUpperCase();
};

const samplePaletteColor = (palette: readonly string[], ratio: number) => {
  if (palette.length === 1) return palette[0];
  const clampedRatio = clamp(ratio, 0, 1);
  const scaled = clampedRatio * (palette.length - 1);
  const index = Math.min(Math.floor(scaled), palette.length - 2);
  const localRatio = scaled - index;
  return interpolateHex(palette[index], palette[index + 1], localRatio);
};

const KPI_OPTIONS = [
  'Technology',
  'Business',
  'Health',
  'Science',
  'Education',
  'Design',
  'Productivity',
  'Finance',
  'Culture',
  'Leadership',
  'Innovation',
  'Lifestyle',
];

const RATIO_OPTIONS: RatioOption[] = [
  { key: '9:16', label: 'Portrait', aspectRatio: 9 / 16 },
  { key: '4:3', label: 'Classic', aspectRatio: 4 / 3 },
  { key: '1:1', label: 'Square', aspectRatio: 1 },
];

const TEXT_STYLE_OPTIONS: TextStyleOption[] = [
  { id: 'insight', label: 'Insight', fontSize: 28, fontWeight: '700' },
  { id: 'brief', label: 'Brief', fontSize: 24, fontWeight: '600' },
  { id: 'note', label: 'Note', fontSize: 22, fontWeight: '500' },
];

export default function ComposeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ parentVideoId?: string }>();
  const { colors } = useTheme();
  const [mode, setMode] = useState<ComposerMode | null>(null);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [selectedAssets, setSelectedAssets] = useState<PickedAsset[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<RatioOption>(RATIO_OPTIONS[1]);
  const [selectedKpis, setSelectedKpis] = useState<string[]>([]);
  const [customKpi, setCustomKpi] = useState('');
  const [coverAsset, setCoverAsset] = useState<PickedAsset | null>(null);
  const [videoCoverPosition, setVideoCoverPosition] = useState(0);
  const [generatedVideoThumbnail, setGeneratedVideoThumbnail] = useState<string | null>(null);
  const [isGeneratingVideoThumbnail, setIsGeneratingVideoThumbnail] = useState(false);
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#1F2937');
  const [canvasTextColor, setCanvasTextColor] = useState('#FFFFFF');
  const [canvasBackgroundImage, setCanvasBackgroundImage] = useState<PickedAsset | null>(null);
  const [textStyle, setTextStyle] = useState<TextStyleOption>(TEXT_STYLE_OPTIONS[0]);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [isPublishing, setIsPublishing] = useState(false);
  const [coverSliderWidth, setCoverSliderWidth] = useState(0);
  const [paletteWidth, setPaletteWidth] = useState(0);
  const [paletteThumbX, setPaletteThumbX] = useState(0);
  const [textPaletteWidth, setTextPaletteWidth] = useState(0);
  const [textPaletteThumbX, setTextPaletteThumbX] = useState(0);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });
  const [textBoxSize, setTextBoxSize] = useState({ width: 0, height: 0 });
  const paletteFrameRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coverDragStartRef = useRef(0);
  const paletteDragStartRef = useRef(0);
  const textPaletteDragStartRef = useRef(0);
  const textPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const hasMovedTextRef = useRef(false);
  const textDragStartRef = useRef({ x: 0, y: 0 });

  const previewAsset = selectedAssets[carouselIndex] ?? selectedAssets[0] ?? null;
  const isTextMode = mode === 'text';
  const isVideoMode = mode === 'video';
  const isCarouselMode = mode === 'carousel';
  const needsCoverTool = isVideoMode || isCarouselMode;

  const aiSuggestions = useMemo(() => {
    const primaryTopic = selectedKpis[0] || 'knowledge';
    const secondaryTopic = selectedKpis[1] || 'insight';
    const refinedDescription = description.trim()
      ? [
          `A concise breakdown connecting ${primaryTopic.toLowerCase()} with a clear takeaway.`,
          `${description.trim()} Focus on the key lesson and why it matters now.`,
        ]
      : [
          `A sharp explainer on ${primaryTopic.toLowerCase()} with practical insight.`,
          `A knowledge-first post connecting ${primaryTopic.toLowerCase()} and ${secondaryTopic.toLowerCase()}.`,
        ];

    const kpiSuggestions = KPI_OPTIONS.filter(
      (kpi) => !selectedKpis.includes(kpi)
    ).slice(0, 4);

    return {
      descriptions: refinedDescription,
      kpis: kpiSuggestions,
    };
  }, [description, selectedKpis]);

  useEffect(() => {
    if (!isTextMode || !previewSize.width || !previewSize.height || hasMovedTextRef.current) {
      return;
    }

    textPosition.setValue({
      x: TEXT_DRAG_INSET,
      y: Math.max(previewSize.height * 0.12, TEXT_DRAG_INSET),
    });
  }, [isTextMode, previewSize.height, previewSize.width, textPosition]);

  useEffect(() => {
    return () => {
      if (paletteFrameRef.current) {
        clearTimeout(paletteFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVideoMode || !previewAsset?.uri || coverAsset) {
      return;
    }

    let cancelled = false;
    const durationMs =
      typeof previewAsset.duration === 'number' && previewAsset.duration > 0
        ? previewAsset.duration * (previewAsset.duration > 1000 ? 1 : 1000)
        : 0;
    const time = durationMs > 0 ? Math.max(durationMs * videoCoverPosition, 0) : 0;

    setIsGeneratingVideoThumbnail(true);

    const timer = setTimeout(async () => {
      try {
        const result = await VideoThumbnails.getThumbnailAsync(previewAsset.uri, {
          time,
          quality: 0.7,
        });

        if (!cancelled) {
          setGeneratedVideoThumbnail(result.uri);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to generate video thumbnail:', error);
        }
      } finally {
        if (!cancelled) {
          setIsGeneratingVideoThumbnail(false);
        }
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [coverAsset, isVideoMode, previewAsset, videoCoverPosition]);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleLaunchMode = async (nextMode: ComposerMode) => {
    setMode(nextMode);
    setSelectedAssets([]);
    setCarouselIndex(0);
    setCoverAsset(null);

    if (nextMode === 'text') {
      setDescription('');
      setCanvasBackgroundImage(null);
      return;
    }

    if (nextMode === 'video') {
      const asset = await pickVideoFromLibrary({ quality: 0.8 });
      if (asset) {
        setSelectedAssets([asset]);
      }
      return;
    }

    if (nextMode === 'photo') {
      const asset = await showImagePickerOptions({ allowsEditing: true, quality: 0.85 });
      if (asset) {
        setSelectedAssets([asset]);
      }
      return;
    }

    const assets = await pickImagesFromLibrary({ quality: 0.85, allowsMultipleSelection: true });
    if (assets.length > 0) {
      setSelectedAssets(assets);
    }
  };

  const handleReplaceMedia = async () => {
    if (!mode || isTextMode) return;

    if (mode === 'video') {
      const asset = await pickVideoFromLibrary({ quality: 0.8 });
      if (asset) setSelectedAssets([asset]);
      return;
    }

    if (mode === 'photo') {
      const asset = await showImagePickerOptions({ allowsEditing: true, quality: 0.85 });
      if (asset) setSelectedAssets([asset]);
      return;
    }

    const assets = await pickImagesFromLibrary({ quality: 0.85, allowsMultipleSelection: true });
    if (assets.length > 0) {
      setSelectedAssets(assets);
      setCarouselIndex(0);
    }
  };

  const handleAddMoreImages = async () => {
    const assets = await pickImagesFromLibrary({ quality: 0.85, allowsMultipleSelection: true });
    if (assets.length > 0) {
      setSelectedAssets((prev) => [...prev, ...assets].slice(0, 10));
    }
  };

  const toggleKpi = (kpi: string) => {
    setSelectedKpis((prev) =>
      prev.includes(kpi) ? prev.filter((item) => item !== kpi) : [...prev, kpi]
    );
  };

  const addCustomKpi = () => {
    const value = customKpi.trim();
    if (!value || selectedKpis.includes(value)) return;
    setSelectedKpis((prev) => [...prev, value]);
    setCustomKpi('');
  };

  const applyDescriptionSuggestion = (value: string) => {
    setDescription(value);
    setActiveSheet(null);
  };

  const addSuggestedKpi = (kpi: string) => {
    if (!selectedKpis.includes(kpi)) {
      setSelectedKpis((prev) => [...prev, kpi]);
    }
  };

  const chooseCoverImage = async () => {
    const asset = await showImagePickerOptions({ allowsEditing: true, quality: 0.85 });
    if (asset) {
      setCoverAsset(asset);
      setActiveSheet(null);
    }
  };

  const chooseCanvasBackgroundImage = async () => {
    const asset = await showImagePickerOptions({ allowsEditing: true, quality: 0.85 });
    if (asset) {
      setCanvasBackgroundImage(asset);
    }
  };

  const applyPaletteColor = (locationX: number) => {
    if (!paletteWidth) return;
    const ratio = clamp(locationX / paletteWidth, 0, 1);
    const color = samplePaletteColor(BACKGROUND_PALETTE_COLORS, ratio);
    setPaletteThumbX(ratio * paletteWidth);

    if (paletteFrameRef.current) {
      clearTimeout(paletteFrameRef.current);
    }

    paletteFrameRef.current = setTimeout(() => {
      setCustomBackgroundColor(color);
      setCanvasBackgroundImage(null);
    }, 0);
  };

  const applyTextPaletteColor = (locationX: number) => {
    if (!textPaletteWidth) return;
    const ratio = clamp(locationX / textPaletteWidth, 0, 1);
    const color = samplePaletteColor(TEXT_PALETTE_COLORS, ratio);
    setTextPaletteThumbX(ratio * textPaletteWidth);
    setCanvasTextColor(color);
  };

  const colorPaletteResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          paletteDragStartRef.current = event.nativeEvent.locationX;
          applyPaletteColor(event.nativeEvent.locationX);
        },
        onPanResponderMove: (_, gestureState) => {
          applyPaletteColor(paletteDragStartRef.current + gestureState.dx);
        },
      }),
    [paletteWidth]
  );

  const textColorPaletteResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          textPaletteDragStartRef.current = event.nativeEvent.locationX;
          applyTextPaletteColor(event.nativeEvent.locationX);
        },
        onPanResponderMove: (_, gestureState) => {
          applyTextPaletteColor(textPaletteDragStartRef.current + gestureState.dx);
        },
      }),
    [textPaletteWidth]
  );

  const validateComposer = () => {
    const hasContent = isTextMode ? description.trim().length > 0 : selectedAssets.length > 0;
    if (!hasContent) {
      Alert.alert('Missing content', 'Add content to your post before publishing.');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Description required', 'Add a short description before publishing.');
      return false;
    }

    if (selectedKpis.length < 2) {
      Alert.alert('Select at least 2 KPIs', 'Choose two or more KPIs so the post can be classified properly.');
      return false;
    }

    return true;
  };

  const handlePublish = () => {
    if (!validateComposer()) return;

    setIsPublishing(true);
    const payload = {
      parentVideoId: params.parentVideoId ?? null,
      mode,
      ratio: selectedRatio.key,
      description,
      selectedKpis,
      assets: selectedAssets.map((asset) => asset.fileName || asset.uri),
      cover:
        coverAsset?.fileName ||
        (isVideoMode ? `frame_${Math.round(videoCoverPosition * 100)}` : previewAsset?.fileName || null),
    };

    setTimeout(() => {
      setIsPublishing(false);
      console.log('Compose payload:', payload);
      Alert.alert(
        'Composer ready',
        'The new compose flow is collecting the right payload for the upload pipeline. Backend wiring can plug into this next.',
        [{ text: 'OK', onPress: handleClose }]
      );
    }, 500);
  };

  const updateVideoCoverPosition = (locationX: number) => {
    if (!coverSliderWidth) return;
    const next = Math.min(Math.max((locationX - 16) / coverSliderWidth, 0), 1);
    setVideoCoverPosition(next);
  };

  const handleCoverSliderLayout = (event: LayoutChangeEvent) => {
    setCoverSliderWidth(Math.max(event.nativeEvent.layout.width - 32, 1));
  };

  const handlePaletteLayout = (event: LayoutChangeEvent) => {
    const width = Math.max(event.nativeEvent.layout.width, 1);
    setPaletteWidth(width);
    setPaletteThumbX((prev) => clamp(prev, 0, width));
  };

  const handleTextPaletteLayout = (event: LayoutChangeEvent) => {
    const width = Math.max(event.nativeEvent.layout.width, 1);
    setTextPaletteWidth(width);
    setTextPaletteThumbX((prev) => clamp(prev, 0, width));
  };

  const handlePreviewLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setPreviewSize({ width, height });
  };

  const coverSliderResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          coverDragStartRef.current = event.nativeEvent.locationX;
          updateVideoCoverPosition(event.nativeEvent.locationX);
        },
        onPanResponderMove: (_, gestureState) => {
          updateVideoCoverPosition(coverDragStartRef.current + gestureState.dx);
        },
      }),
    [coverSliderWidth]
  );

  const textDragResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
          textPosition.stopAnimation((value) => {
            textDragStartRef.current = value;
          });
        },
        onPanResponderMove: (_, gestureState) => {
          hasMovedTextRef.current = true;
          textPosition.setValue({
            x: clamp(
              textDragStartRef.current.x + gestureState.dx,
              TEXT_DRAG_INSET,
              Math.max(previewSize.width - textBoxSize.width - TEXT_DRAG_INSET, TEXT_DRAG_INSET)
            ),
            y: clamp(
              textDragStartRef.current.y + gestureState.dy,
              TEXT_DRAG_INSET,
              Math.max(previewSize.height - textBoxSize.height - TEXT_DRAG_INSET, TEXT_DRAG_INSET)
            ),
          });
        },
      }),
    [previewSize.height, previewSize.width, textBoxSize.height, textBoxSize.width, textPosition]
  );

  const renderLauncher = () => {
    const launcherCards = [
      {
        key: 'video' as const,
        title: 'Video',
        subtitle: 'Share a lesson, demo, or explainer',
        icon: <Video size={28} color="#FFFFFF" strokeWidth={2.2} />,
        colors: ['#1D4ED8', '#312E81'] as [string, string],
      },
      {
        key: 'photo' as const,
        title: 'Photo',
        subtitle: 'Post a visual idea with context',
        icon: <Upload size={28} color="#FFFFFF" strokeWidth={2.2} />,
        colors: ['#0F766E', '#166534'] as [string, string],
      },
      // {
      //   key: 'carousel' as const,
      //   title: 'Carousel',
      //   subtitle: 'Tell a richer story with multiple slides',
      //   icon: <Images size={28} color="#FFFFFF" strokeWidth={2.2} />,
      //   colors: ['#9A3412', '#C2410C'] as [string, string],
      // },
      {
        key: 'text' as const,
        title: 'Text Canvas',
        subtitle: 'Craft a knowledge-first visual post',
        icon: <PenSquare size={28} color="#FFFFFF" strokeWidth={2.2} />,
        colors: ['#7C3AED', '#BE185D'] as [string, string],
      },
    ];

    return (
      <View style={styles.launcherContainer}>
        <Text style={[styles.launcherTitle, { color: colors.text }]}>Create</Text>

        <View style={styles.launcherGrid}>
          {launcherCards.map((card) => (
            <TouchableOpacity
              key={card.key}
              style={styles.launcherCard}
              activeOpacity={0.85}
              onPress={() => handleLaunchMode(card.key)}
            >
              <LinearGradient colors={card.colors} style={styles.launcherCardGradient}>
                <View style={styles.launcherIcon}>{card.icon}</View>
                <Text style={styles.launcherCardTitle}>{card.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderPreview = () => {
    if (isTextMode) {
      return (
        <View
          style={[styles.previewCard, { aspectRatio: selectedRatio.aspectRatio, backgroundColor: customBackgroundColor }]}
          onLayout={handlePreviewLayout}
        >
          {canvasBackgroundImage ? (
            <Image source={{ uri: canvasBackgroundImage.uri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <LinearGradient colors={[customBackgroundColor, customBackgroundColor]} style={styles.previewGradient} />
          )}
          <Animated.View
            style={[
              styles.draggableTextWrap,
              {
                maxWidth: Math.max(previewSize.width - 12, 120),
                transform: textPosition.getTranslateTransform(),
              },
            ]}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setTextBoxSize({ width, height });
            }}
            {...textDragResponder.panHandlers}
          >
            <Text
              style={[
                styles.canvasText,
                {
                  color: canvasTextColor,
                  fontSize: textStyle.fontSize,
                  fontWeight: textStyle.fontWeight,
                  textAlign,
                },
              ]}
              onTextLayout={(event) => {
                const lines = event.nativeEvent.lines;
                if (!lines?.length) return;

                const measuredWidth = Math.max(...lines.map((line) => line.width)) + TEXT_WRAP_HORIZONTAL_PADDING * 2;
                const measuredHeight =
                  lines.reduce((sum, line) => sum + line.height, 0) + TEXT_WRAP_VERTICAL_PADDING * 2;

                setTextBoxSize((prev) => {
                  const nextWidth = Math.ceil(measuredWidth);
                  const nextHeight = Math.ceil(measuredHeight);

                  if (prev.width === nextWidth && prev.height === nextHeight) {
                    return prev;
                  }

                  return {
                    width: nextWidth,
                    height: nextHeight,
                  };
                });
              }}
            >
              {description || 'Write a sharp idea worth sharing.'}
            </Text>
          </Animated.View>
        </View>
      );
    }

    if (!previewAsset) {
      return (
        <TouchableOpacity
          style={[
            styles.previewCard,
            styles.emptyPreview,
            { aspectRatio: selectedRatio.aspectRatio, backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          activeOpacity={0.85}
          onPress={handleReplaceMedia}
        >
          <Upload size={28} color={colors.textSecondary} strokeWidth={2.2} />
          <Text style={[styles.emptyPreviewTitle, { color: colors.text }]}>Add your media</Text>
          <Text style={[styles.emptyPreviewSubtitle, { color: colors.textSecondary }]}>
            Start with content and refine the details afterward.
          </Text>
        </TouchableOpacity>
      );
    }

    if (isVideoMode) {
      return (
        <View style={[styles.previewCard, { aspectRatio: selectedRatio.aspectRatio, backgroundColor: '#0F172A' }]}>
          {coverAsset ? <Image source={{ uri: coverAsset.uri }} style={styles.previewImage} resizeMode="cover" /> : null}
          {!coverAsset && generatedVideoThumbnail ? (
            <Image source={{ uri: generatedVideoThumbnail }} style={styles.previewImage} resizeMode="cover" />
          ) : null}
          <View style={styles.videoOverlay}>
            <View style={styles.videoBadge}>
              <Clapperboard size={20} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.videoBadgeText}>Video</Text>
            </View>
            <Text style={styles.videoFileName} numberOfLines={2}>
              {previewAsset.fileName || 'Selected video'}
            </Text>
            <Text style={styles.videoMeta}>
              {coverAsset
                ? 'Custom thumbnail selected'
                : isGeneratingVideoThumbnail
                  ? 'Updating thumbnail preview...'
                  : `Cover frame at ${Math.round(videoCoverPosition * 100)}%`}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.previewCard, { aspectRatio: selectedRatio.aspectRatio, backgroundColor: colors.surface }]}>
        <Image source={{ uri: previewAsset.uri }} style={styles.previewImage} resizeMode="cover" />
      </View>
    );
  };

  const renderAssetStrip = () => {
    if (!isCarouselMode || selectedAssets.length === 0) return null;

    return (
      <View style={styles.assetStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assetStripContent}>
          {selectedAssets.map((asset, index) => (
            <TouchableOpacity
              key={`${asset.uri}-${index}`}
              style={[
                styles.assetThumb,
                {
                  borderColor: index === carouselIndex ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              activeOpacity={0.85}
              onPress={() => setCarouselIndex(index)}
            >
              <Image source={{ uri: asset.uri }} style={styles.assetThumbImage} resizeMode="cover" />
              {index === carouselIndex ? (
                <View style={[styles.assetThumbIndicator, { backgroundColor: colors.primary }]}>
                  <Check size={12} color="#FFFFFF" strokeWidth={2.6} />
                </View>
              ) : null}
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.addAssetButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            activeOpacity={0.8}
            onPress={handleAddMoreImages}
          >
            <Plus size={18} color={colors.textSecondary} strokeWidth={2.4} />
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  const renderMetaSummary = () => (
    <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Description</Text>
        <View style={styles.summaryValueRow}>
          <Text style={[styles.summaryValue, { color: colors.text }]} numberOfLines={2}>
            {description || 'Add a concise, knowledge-first description'}
          </Text>
          <TouchableOpacity activeOpacity={0.75} onPress={() => setActiveSheet('description')}>
            <Pencil size={16} color={colors.primary} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>KPIs</Text>
        <View style={styles.summaryValueRow}>
          <View style={styles.summaryChips}>
            {selectedKpis.length > 0 ? (
              selectedKpis.map((kpi) => (
                <View key={kpi} style={[styles.summaryChip, { backgroundColor: colors.background }]}>
                  <Text style={[styles.summaryChipText, { color: colors.text }]}>{kpi}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.summaryPlaceholder, { color: colors.textTertiary }]}>Select at least 2 KPIs</Text>
            )}
          </View>
          <TouchableOpacity activeOpacity={0.75} onPress={() => setActiveSheet('kpis')}>
            <Pencil size={16} color={colors.primary} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>

      {!isTextMode ? (
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Media</Text>
          <View style={styles.summaryValueRow}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {selectedAssets.length > 1 ? `${selectedAssets.length} selected` : previewAsset?.fileName || 'No media'}
            </Text>
            <TouchableOpacity activeOpacity={0.75} onPress={handleReplaceMedia}>
              <Pencil size={16} color={colors.primary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );

  const renderSheetShell = (title: string, subtitle: string | undefined, content: ReactNode) => (
    <>
      <View style={styles.sheetTopRow}>
        <View style={styles.sheetTitleWrap}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          ) : null}
        </View>
        <View style={styles.sheetActionRow}>
          <TouchableOpacity
            style={[styles.sheetActionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => setActiveSheet(null)}
          >
            <X size={18} color={colors.textSecondary} strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sheetActionButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={() => setActiveSheet(null)}
          >
            <Check size={18} color="#FFFFFF" strokeWidth={2.6} />
          </TouchableOpacity>
        </View>
      </View>
      {content}
    </>
  );

  const renderToolRail = () => {
    const tools = [
      { key: 'ratio', label: 'Ratio', icon: Crop, enabled: true },
      { key: 'cover', label: 'Cover', icon: Upload, enabled: needsCoverTool },
      { key: 'background', label: 'Background', icon: Palette, enabled: isTextMode },
      { key: 'style', label: 'Style', icon: WandSparkles, enabled: isTextMode },
      { key: 'ai', label: 'AI', icon: Sparkles, enabled: true },
    ] as const;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolRail}>
        {tools.filter((tool) => tool.enabled).map((tool) => {
          const Icon = tool.icon;
          const value =
            tool.key === 'ratio'
              ? selectedRatio.key
              : tool.key === 'cover'
                ? coverAsset
                  ? 'Custom'
                  : 'Choose'
                : tool.key === 'background'
                  ? 'Theme'
                  : tool.key === 'style'
                    ? textStyle.label
                    : 'Suggestions';
          return (
            <TouchableOpacity
              key={tool.key}
              style={[styles.toolChip, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              activeOpacity={0.8}
              onPress={() => setActiveSheet(tool.key)}
            >
              <Icon size={16} color={colors.textSecondary} strokeWidth={2.2} />
              <View style={styles.toolChipCopy}>
                <Text style={[styles.toolChipLabel, { color: colors.text }]}>{tool.label}</Text>
                <Text style={[styles.toolChipValue, { color: colors.textSecondary }]}>{value}</Text>
              </View>
              <ChevronRight size={14} color={colors.textTertiary} strokeWidth={2.5} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderSheetContent = () => {
    if (!activeSheet) return null;

    if (activeSheet === 'ratio') {
      return renderSheetShell(
        'Choose post ratio',
        undefined,
        <View style={styles.ratioGrid}>
          {RATIO_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.ratioCard,
                {
                  borderColor: selectedRatio.key === option.key ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedRatio(option)}
            >
              <View style={[styles.ratioFrame, { aspectRatio: option.aspectRatio, borderColor: colors.textSecondary }]} />
              <Text style={[styles.ratioLabel, { color: colors.text }]}>{option.key}</Text>
              <Text style={[styles.ratioSubtitle, { color: colors.textSecondary }]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (activeSheet === 'description') {
      return renderSheetShell(
        isTextMode ? 'Write your canvas text' : 'Write your description',
        undefined,
        <TextInput
          style={[
            styles.descriptionInput,
            { borderColor: colors.border, backgroundColor: colors.background, color: colors.text },
          ]}
          placeholder={isTextMode ? 'Write the idea that should appear on the canvas...' : 'What should people learn from this post?'}
          placeholderTextColor={colors.textTertiary}
          multiline
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />
      );
    }

    if (activeSheet === 'kpis') {
      return renderSheetShell(
        'Select at least 2 KPIs',
        undefined,
        <>
          <View style={styles.selectedKpiRow}>
            {selectedKpis.map((kpi) => (
              <TouchableOpacity
                key={kpi}
                style={[
                  styles.selectedKpiChip,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => toggleKpi(kpi)}
              >
                <Text style={[styles.selectedKpiChipText, { color: colors.textSecondary }]}>{kpi}</Text>
                <X size={12} color={colors.textTertiary} strokeWidth={2.4} />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.kpiGrid}>
            {KPI_OPTIONS.map((kpi) => (
              <TouchableOpacity
                key={kpi}
                style={[
                  styles.kpiChip,
                  {
                    borderColor: selectedKpis.includes(kpi) ? colors.primary : colors.border,
                    backgroundColor: selectedKpis.includes(kpi) ? colors.primary : colors.surface,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => toggleKpi(kpi)}
              >
                <Text
                  style={[
                    styles.kpiChipText,
                    { color: selectedKpis.includes(kpi) ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {kpi}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customKpiRow}>
            <TextInput
              style={[
                styles.customKpiInput,
                { borderColor: colors.border, backgroundColor: colors.background, color: colors.text },
              ]}
              placeholder="Add a custom KPI"
              placeholderTextColor={colors.textTertiary}
              value={customKpi}
              onChangeText={setCustomKpi}
            />
            <TouchableOpacity
              style={[styles.customKpiButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={addCustomKpi}
            >
              <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
            </TouchableOpacity>
          </View>
        </>
      );
    }

    if (activeSheet === 'cover') {
      return renderSheetShell(
        'Choose your cover',
        undefined,
        <>
          {isVideoMode ? (
            <View style={styles.coverOptionGroup}>
              <Text style={[styles.coverLabel, { color: colors.textSecondary }]}>Scrub to any frame</Text>
              <View
                style={[styles.coverSliderWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onLayout={handleCoverSliderLayout}
                {...coverSliderResponder.panHandlers}
              >
                <View style={[styles.coverSliderTrack, { backgroundColor: colors.border }]} />
                <View
                  style={[
                    styles.coverSliderProgress,
                    { backgroundColor: colors.primary, width: coverSliderWidth * videoCoverPosition },
                  ]}
                />
                <View
                  style={[
                    styles.coverSliderThumb,
                    {
                      backgroundColor: colors.primary,
                      left: 16 + coverSliderWidth * videoCoverPosition,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.coverSliderValue, { color: colors.text }]}>
                Frame selected at {Math.round(videoCoverPosition * 100)}%
              </Text>
            </View>
          ) : null}

          {isCarouselMode ? (
            <View style={styles.coverOptionGroup}>
              <Text style={[styles.coverLabel, { color: colors.textSecondary }]}>Pick the lead image</Text>
              <View style={styles.carouselCoverGrid}>
                {selectedAssets.map((asset, index) => (
                  <TouchableOpacity
                    key={`${asset.uri}-${index}-cover`}
                    style={[
                      styles.carouselCoverThumb,
                      {
                        borderColor: index === carouselIndex ? colors.primary : colors.border,
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setCarouselIndex(index)}
                  >
                    <Image source={{ uri: asset.uri }} style={styles.assetThumbImage} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.thumbnailButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.85}
            onPress={chooseCoverImage}
          >
            <Upload size={18} color={colors.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.thumbnailButtonText, { color: colors.text }]}>
              {coverAsset ? `Thumbnail: ${coverAsset.fileName}` : 'Upload a thumbnail image'}
            </Text>
          </TouchableOpacity>
        </>
      );
    }

    if (activeSheet === 'background') {
      return renderSheetShell(
        'Pick a background',
        undefined,
        <>
          <View style={styles.paletteSection}>
            <View style={styles.paletteHeader}>
              <Text style={[styles.coverLabel, { color: colors.textSecondary }]}>Background</Text>
              <View style={[styles.paletteColorPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.paletteColorSwatch, { backgroundColor: customBackgroundColor }]} />
                <Text style={[styles.paletteColorText, { color: colors.text }]}>{customBackgroundColor}</Text>
              </View>
            </View>
            <View
              style={[styles.paletteTrackWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onLayout={handlePaletteLayout}
              {...colorPaletteResponder.panHandlers}
            >
              <LinearGradient
                colors={BACKGROUND_PALETTE_COLORS}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.paletteTrack}
              />
              <View
                style={[
                  styles.paletteThumb,
                  {
                    left: clamp(paletteThumbX - 12, 0, Math.max(paletteWidth - 24, 0)),
                    backgroundColor: customBackgroundColor,
                    borderColor: getContrastText(customBackgroundColor) === '#FFFFFF' ? '#FFFFFF' : '#0F172A',
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.paletteSection}>
            <View style={styles.paletteHeader}>
              <Text style={[styles.coverLabel, { color: colors.textSecondary }]}>Text color</Text>
              <View style={[styles.paletteColorPreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.paletteColorSwatch, { backgroundColor: canvasTextColor }]} />
                <Text style={[styles.paletteColorText, { color: colors.text }]}>{canvasTextColor}</Text>
              </View>
            </View>
            <View
              style={[styles.paletteTrackWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onLayout={handleTextPaletteLayout}
              {...textColorPaletteResponder.panHandlers}
            >
              <LinearGradient
                colors={TEXT_PALETTE_COLORS}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.paletteTrack}
              />
              <View
                style={[
                  styles.paletteThumb,
                  {
                    left: clamp(textPaletteThumbX - 12, 0, Math.max(textPaletteWidth - 24, 0)),
                    backgroundColor: canvasTextColor,
                    borderColor: getContrastText(canvasTextColor) === '#FFFFFF' ? '#FFFFFF' : '#0F172A',
                  },
                ]}
              />
            </View>
          </View>
          <TouchableOpacity
            style={[styles.thumbnailButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.85}
            onPress={chooseCanvasBackgroundImage}
          >
            <Upload size={18} color={colors.textSecondary} strokeWidth={2.2} />
            <Text style={[styles.thumbnailButtonText, { color: colors.text }]}>
              {canvasBackgroundImage ? `Background: ${canvasBackgroundImage.fileName}` : 'Upload background image'}
            </Text>
          </TouchableOpacity>
        </>
      );
    }

    if (activeSheet === 'style') {
      return renderSheetShell(
        'Canvas style',
        undefined,
        <>
          <View style={styles.textStyleList}>
            {TEXT_STYLE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.textStyleCard,
                  {
                    borderColor: textStyle.id === option.id ? colors.primary : colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => setTextStyle(option)}
              >
                <Text style={[styles.textStylePreview, { color: colors.text, fontSize: option.fontSize - 8, fontWeight: option.fontWeight }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.alignRow}>
            {([
              { key: 'left' as const, icon: AlignLeft },
              { key: 'center' as const, icon: AlignCenter },
              { key: 'right' as const, icon: AlignRight },
            ]).map(({ key, icon: AlignIcon }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.alignButton,
                  {
                    borderColor: textAlign === key ? colors.primary : colors.border,
                    backgroundColor: textAlign === key ? colors.primary : colors.surface,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => setTextAlign(key)}
              >
                <AlignIcon
                  size={18}
                  color={textAlign === key ? '#FFFFFF' : colors.text}
                  strokeWidth={2.2}
                />
              </TouchableOpacity>
            ))}
          </View>
        </>
      );
    }

    return renderSheetShell(
      'AI suggestions',
      undefined,
      <>
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Lightbulb size={16} color={colors.primary} strokeWidth={2.4} />
            <Text style={[styles.aiHeaderText, { color: colors.text }]}>Suggested descriptions</Text>
          </View>
          {aiSuggestions.descriptions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion}
              style={[styles.aiCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.85}
              onPress={() => applyDescriptionSuggestion(suggestion)}
            >
              <Text style={[styles.aiCardText, { color: colors.text }]}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.aiSection}>
          <View style={styles.aiHeader}>
            <Tag size={16} color={colors.primary} strokeWidth={2.4} />
            <Text style={[styles.aiHeaderText, { color: colors.text }]}>Suggested KPIs</Text>
          </View>
          <View style={styles.aiKpiRow}>
            {aiSuggestions.kpis.map((kpi) => (
              <TouchableOpacity
                key={kpi}
                style={[styles.aiKpiChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.85}
                onPress={() => addSuggestedKpi(kpi)}
              >
                <Plus size={14} color={colors.primary} strokeWidth={2.4} />
                <Text style={[styles.aiKpiText, { color: colors.text }]}>{kpi}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.screen, { backgroundColor: colors.background }]}>
          <View style={[styles.topBar, { borderBottomColor: colors.borderLight }]}>
            <TouchableOpacity style={styles.topBarButton} activeOpacity={0.75} onPress={handleClose}>
              <ChevronLeft size={24} color={colors.text} strokeWidth={2.4} />
            </TouchableOpacity>
            <View style={styles.topBarText}>
              <Text style={[styles.topBarTitle, { color: colors.text }]}>
                {mode ? 'Compose' : 'New Post'}
              </Text>
              {params.parentVideoId ? (
                <Text style={[styles.topBarSubtitle, { color: colors.textSecondary }]}>
                  Spider response
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={[
                styles.publishButton,
                { backgroundColor: validatePublishButton(mode, selectedAssets, description, selectedKpis, isTextMode) ? colors.primary : colors.surface, borderColor: colors.border },
              ]}
              activeOpacity={0.82}
              onPress={handlePublish}
              disabled={isPublishing}
            >
              <Text
                style={[
                  styles.publishButtonText,
                  {
                    color: validatePublishButton(mode, selectedAssets, description, selectedKpis, isTextMode)
                      ? '#FFFFFF'
                      : colors.textSecondary,
                  },
                ]}
              >
                {isPublishing ? 'Posting...' : 'Publish'}
              </Text>
            </TouchableOpacity>
          </View>

          {!mode ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {renderLauncher()}
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {renderPreview()}
              {renderAssetStrip()}
              {renderToolRail()}
              {renderMetaSummary()}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={activeSheet !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveSheet(null)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setActiveSheet(null)}>
          <Pressable
            style={[styles.sheetContainer, { backgroundColor: colors.background, borderTopColor: colors.borderLight }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            {renderSheetContent()}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function validatePublishButton(
  mode: ComposerMode | null,
  assets: PickedAsset[],
  description: string,
  selectedKpis: string[],
  isTextMode: boolean
) {
  if (!mode) return false;
  const hasContent = isTextMode ? description.trim().length > 0 : assets.length > 0;
  return hasContent && description.trim().length > 0 && selectedKpis.length >= 2;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topBarButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarText: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  topBarSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  publishButton: {
    minWidth: 90,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  publishButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  launcherContainer: {
    gap: 20,
  },
  launcherTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  launcherGrid: {
    gap: 14,
  },
  launcherCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  launcherCardGradient: {
    minHeight: 150,
    padding: 20,
    justifyContent: 'space-between',
  },
  launcherIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  launcherCardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewCard: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  emptyPreview: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingHorizontal: 24,
    gap: 8,
  },
  emptyPreviewTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyPreviewSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  videoBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
  },
  videoBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  videoFileName: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  videoMeta: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.84)',
  },
  canvasText: {
    lineHeight: 36,
    textShadowColor: 'rgba(15, 23, 42, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  draggableTextWrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    minWidth: 0,
    alignSelf: 'flex-start',
    paddingHorizontal: TEXT_WRAP_HORIZONTAL_PADDING,
    paddingVertical: TEXT_WRAP_VERTICAL_PADDING,
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  assetStrip: {
    marginTop: 14,
  },
  assetStripContent: {
    gap: 10,
    paddingRight: 6,
  },
  assetThumb: {
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
  },
  assetThumbImage: {
    width: '100%',
    height: '100%',
  },
  assetThumbIndicator: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addAssetButton: {
    width: 72,
    height: 72,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolRail: {
    gap: 10,
    paddingTop: 18,
    paddingRight: 4,
  },
  toolChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 114,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  toolChipCopy: {
    flex: 1,
    gap: 2,
  },
  toolChipLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  toolChipValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryCard: {
    marginTop: 18,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  summaryRow: {
    gap: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryValue: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryChips: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  summaryChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryPlaceholder: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    gap: 14,
    maxHeight: '78%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 48,
    height: 5,
    borderRadius: 999,
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  sheetTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetTitleWrap: {
    flex: 1,
    gap: 6,
  },
  sheetActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sheetActionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  ratioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ratioCard: {
    width: '47%',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 10,
  },
  ratioFrame: {
    width: 52,
    borderWidth: 2,
    borderRadius: 8,
  },
  ratioLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  ratioSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionInput: {
    minHeight: 180,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  selectedKpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedKpiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  selectedKpiChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  kpiChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  customKpiRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  customKpiInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  customKpiButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverOptionGroup: {
    gap: 10,
  },
  coverLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  coverSliderWrap: {
    marginTop: 2,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  coverSliderTrack: {
    height: 6,
    borderRadius: 999,
    width: '100%',
  },
  coverSliderProgress: {
    position: 'absolute',
    left: 16,
    height: 6,
    borderRadius: 999,
  },
  coverSliderThumb: {
    position: 'absolute',
    top: 14,
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
  },
  coverSliderValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  carouselCoverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  carouselCoverThumb: {
    width: 82,
    height: 82,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
  },
  thumbnailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  thumbnailButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  paletteSection: {
    gap: 12,
  },
  paletteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  paletteColorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  paletteColorSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  paletteColorText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  paletteTrackWrap: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  paletteTrack: {
    height: 18,
    borderRadius: 999,
  },
  paletteThumb: {
    position: 'absolute',
    top: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
  textStyleList: {
    gap: 10,
  },
  textStyleCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  textStylePreview: {
    fontWeight: '700',
  },
  alignRow: {
    flexDirection: 'row',
    gap: 10,
  },
  alignButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  aiSection: {
    gap: 10,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiHeaderText: {
    fontSize: 15,
    fontWeight: '700',
  },
  aiCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  aiCardText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  aiKpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  aiKpiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  aiKpiText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
