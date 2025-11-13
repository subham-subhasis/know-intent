import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { X, DollarSign, Coins, Camera, Image as ImageIcon, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { sessionStorage } from '@/lib/sessionStorage';
import { getPresignedUrl, updateProfileImage, updateUsername } from '@/src/api/userService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileSliderProps {
  visible: boolean;
  onClose: () => void;
}

export function ProfileSlider({ visible, onClose }: ProfileSliderProps) {
  const { colors, theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      loadUser();
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadUser = async () => {
    const userData = await sessionStorage.getUser();
    setUser(userData);
    setNewUsername(userData?.identifier || '');
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleEditUsername = () => {
    setIsEditing(true);
  };

  const handleSaveUsername = async () => {
    if (!user || !newUsername.trim() || newUsername === user.identifier) {
      setIsEditing(false);
      return;
    }

    setUpdating(true);
    try {
      const result = await updateUsername({
        current_uid: user.uid,
        new_username: newUsername.trim(),
      });

      if (result.ok) {
        const updatedUser = { ...user, identifier: newUsername.trim(), uid: result.uid };
        await sessionStorage.saveUser(updatedUser);
        await loadUser();
        setIsEditing(false);
      } else {
        Alert.alert('Update Failed', 'Unable to update username. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update username');
    } finally {
      setUpdating(false);
    }
  };

  const handleProfilePicturePress = () => {
    setShowImagePicker(true);
  };

  const handleImageOptionSelect = (option: 'camera' | 'gallery') => {
    setShowImagePicker(false);
    if (option === 'gallery') {
      handleSelectFromGallery();
    } else {
      Alert.alert('Camera', 'Camera feature will be available in the mobile app');
    }
  };

  const handleSelectFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          uploadProfileImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const uploadProfileImage = async (uri: string) => {
    if (!user) return;

    setUploading(true);
    try {
      const fileName = `avatar_${Date.now()}.jpg`;
      const presignedData = await getPresignedUrl({
        uid: user.uid,
        profile_id: user.profile_id || '1',
        file_name: fileName,
        content_type: 'image/jpeg',
      });

      if (!presignedData.ok) {
        throw new Error('Failed to get upload URL');
      }

      const response = await fetch(uri);
      const fileBlob = await response.blob();

      const uploadResponse = await fetch(presignedData.upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        body: fileBlob,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }

      const updateResult = await updateProfileImage({
        uid: user.uid,
        profile_id: user.profile_id || '1',
        image_url: presignedData.image_url,
      });

      if (updateResult.ok) {
        await sessionStorage.updateUserProfileImage(updateResult.profile_image_url);
        await loadUser();
      }
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Unable to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            styles.slider,
            { backgroundColor: colors.background, transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.icon} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Account</Text>
            <View style={styles.closeButton} />
          </View>

          <View style={styles.content}>
            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={handleProfilePicturePress}
                disabled={uploading}
                activeOpacity={0.7}
              >
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  {user?.profile_image_url ? (
                    <Image
                      source={{ uri: user.profile_image_url }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={[styles.avatarText, { color: colors.background }]}>
                      {user?.identifier?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  )}
                </View>
                <View style={[styles.cameraOverlay, { backgroundColor: colors.primary }]}>
                  {uploading ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Camera size={20} color={colors.background} strokeWidth={2} />
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.earningsRow}>
                <View style={[styles.earningBox, { backgroundColor: colors.surface }]}>
                  <DollarSign size={20} color="#10B981" strokeWidth={2.5} />
                  <Text style={[styles.earningValue, { color: colors.text }]}>0</Text>
                  <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>Earned</Text>
                </View>

                <View style={[styles.earningBox, { backgroundColor: colors.surface }]}>
                  <Coins size={20} color="#F59E0B" strokeWidth={2.5} />
                  <Text style={[styles.earningValue, { color: colors.text }]}>0</Text>
                  <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>Intent Coins</Text>
                </View>
              </View>

              <View style={styles.usernameSection}>
                <Text style={[styles.uidLabel, { color: colors.textSecondary }]}>Username</Text>
                <View style={styles.usernameRow}>
                  {isEditing ? (
                    <>
                      <TextInput
                        style={[
                          styles.usernameInput,
                          {
                            color: colors.text,
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          }
                        ]}
                        value={newUsername}
                        onChangeText={setNewUsername}
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                        onPress={handleSaveUsername}
                        disabled={updating}
                        activeOpacity={0.7}
                      >
                        {updating ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
                        )}
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.usernameText, { color: colors.text }]}>
                        {user?.identifier || 'User'}
                      </Text>
                      <TouchableOpacity onPress={handleEditUsername} activeOpacity={0.7}>
                        <Text style={styles.editLink}>edit</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
                <Text style={[styles.uidText, { color: colors.textSecondary }]}>
                  UID: {user?.uid || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {showImagePicker && (
            <View style={[styles.imagePickerOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
              <View style={[styles.imagePickerModal, { backgroundColor: colors.background }]}>
                <TouchableOpacity
                  style={[styles.imageOption, { borderBottomColor: colors.borderLight }]}
                  onPress={() => handleImageOptionSelect('camera')}
                  activeOpacity={0.7}
                >
                  <Camera size={24} color={colors.icon} strokeWidth={2} />
                  <Text style={[styles.imageOptionText, { color: colors.text }]}>Take Picture</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.imageOption, { borderBottomColor: colors.borderLight }]}
                  onPress={() => handleImageOptionSelect('gallery')}
                  activeOpacity={0.7}
                >
                  <ImageIcon size={24} color={colors.icon} strokeWidth={2} />
                  <Text style={[styles.imageOptionText, { color: colors.text }]}>Choose From Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imageOption}
                  onPress={() => setShowImagePicker(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelText, { color: '#DC2626' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  overlayTouchable: {
    flex: 1,
  },
  slider: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  earningBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  earningValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  earningLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  usernameSection: {
    width: '100%',
  },
  uidLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  usernameInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uidText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  imagePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  imagePickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  imageOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    textAlign: 'center',
    width: '100%',
  },
});
