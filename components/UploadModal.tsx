import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Upload, Image, Video, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface UploadModalProps {
  onClose: () => void;
  parentVideoId?: string;
}

const AVAILABLE_KPIS = [
  'Technology',
  'Business',
  'Health',
  'Science',
  'Art',
  'Music',
  'Sports',
  'Education',
  'Lifestyle',
  'Entertainment',
];

export function UploadModal({ onClose, parentVideoId }: UploadModalProps) {
  const [description, setDescription] = useState('');
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [customKPI, setCustomKPI] = useState('');
  const [showCustomKPI, setShowCustomKPI] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const handleUpload = () => {
    console.log('Upload:', { description, selectedKPI, customKPI, mediaType });
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {parentVideoId ? 'Create Spider Response' : 'Upload Content'}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
          <X size={24} color="#1F2937" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select Media Type</Text>
          <View style={styles.mediaTypeRow}>
            <TouchableOpacity
              style={[
                styles.mediaTypeButton,
                mediaType === 'image' && styles.mediaTypeButtonActive,
              ]}
              onPress={() => setMediaType('image')}
              activeOpacity={0.7}
            >
              <Image
                size={24}
                color={mediaType === 'image' ? '#FFFFFF' : '#6B7280'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.mediaTypeText,
                  mediaType === 'image' && styles.mediaTypeTextActive,
                ]}
              >
                Image
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mediaTypeButton,
                mediaType === 'video' && styles.mediaTypeButtonActive,
              ]}
              onPress={() => setMediaType('video')}
              activeOpacity={0.7}
            >
              <Video
                size={24}
                color={mediaType === 'video' ? '#FFFFFF' : '#6B7280'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.mediaTypeText,
                  mediaType === 'video' && styles.mediaTypeTextActive,
                ]}
              >
                Video
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {mediaType && (
          <TouchableOpacity style={styles.uploadArea} activeOpacity={0.8}>
            <LinearGradient
              colors={['#F3F4F6', '#E5E7EB']}
              style={styles.uploadGradient}
            >
              <Upload size={32} color="#6B7280" strokeWidth={2} />
              <Text style={styles.uploadText}>
                Tap to select {mediaType === 'image' ? 'an image' : 'a video'}
              </Text>
              {mediaType === 'video' && (
                <Text style={styles.uploadHint}>Max duration: 5 minutes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe your content..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Select KPI Category</Text>
          <View style={styles.kpiGrid}>
            {AVAILABLE_KPIS.map((kpi) => (
              <TouchableOpacity
                key={kpi}
                style={[
                  styles.kpiChip,
                  selectedKPI === kpi && styles.kpiChipActive,
                ]}
                onPress={() => {
                  setSelectedKPI(kpi);
                  setShowCustomKPI(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.kpiChipText,
                    selectedKPI === kpi && styles.kpiChipTextActive,
                  ]}
                >
                  {kpi}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[
                styles.kpiChip,
                styles.kpiChipCustom,
                showCustomKPI && styles.kpiChipActive,
              ]}
              onPress={() => {
                setShowCustomKPI(true);
                setSelectedKPI(null);
              }}
              activeOpacity={0.7}
            >
              <Plus
                size={16}
                color={showCustomKPI ? '#FFFFFF' : '#6B7280'}
                strokeWidth={2}
              />
              <Text
                style={[
                  styles.kpiChipText,
                  showCustomKPI && styles.kpiChipTextActive,
                ]}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {showCustomKPI && (
            <TextInput
              style={styles.customKPIInput}
              placeholder="Enter custom KPI..."
              placeholderTextColor="#9CA3AF"
              value={customKPI}
              onChangeText={setCustomKPI}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!mediaType || !description || (!selectedKPI && !customKPI)) &&
              styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          activeOpacity={0.8}
          disabled={!mediaType || !description || (!selectedKPI && !customKPI)}
        >
          <LinearGradient
            colors={
              mediaType && description && (selectedKPI || customKPI)
                ? ['#667eea', '#764ba2']
                : ['#D1D5DB', '#9CA3AF']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.uploadButtonGradient}
          >
            <Text style={styles.uploadButtonText}>Upload</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  mediaTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  mediaTypeButtonActive: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  mediaTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  mediaTypeTextActive: {
    color: '#FFFFFF',
  },
  uploadArea: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  uploadGradient: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  uploadHint: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    minHeight: 100,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  kpiChipCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  kpiChipActive: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  kpiChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  kpiChipTextActive: {
    color: '#FFFFFF',
  },
  customKPIInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        paddingBottom: 32,
      },
    }),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  uploadButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
