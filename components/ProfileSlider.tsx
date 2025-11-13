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
  Switch,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { X, DollarSign, Coins, Camera, Image as ImageIcon, Check, Settings as SettingsIcon, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { sessionStorage } from '@/lib/sessionStorage';
import { getPresignedUrl, updateProfileImage, updateUsername } from '@/src/api/userService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileSliderProps {
  visible: boolean;
  onClose: () => void;
}

const USER_EMAIL = 'user@example.com';
const USER_PHONE = '-';

export function ProfileSlider({ visible, onClose }: ProfileSliderProps) {
  const { colors, theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
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
            {!showSettings ? (
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
                      <Camera size={16} color={colors.background} strokeWidth={2} />
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.earningsRow}>
                  <View style={[styles.earningBox, { backgroundColor: colors.surface }]}>
                    <DollarSign size={16} color="#10B981" strokeWidth={2.5} />
                    <Text style={[styles.earningValue, { color: colors.text }]}>0</Text>
                    <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>Earned</Text>
                  </View>

                  <View style={[styles.earningBox, { backgroundColor: colors.surface }]}>
                    <Coins size={16} color="#F59E0B" strokeWidth={2.5} />
                    <Text style={[styles.earningValue, { color: colors.text }]}>0</Text>
                    <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>Intent Coins</Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>User Name:</Text>
                    <View style={styles.infoValueContainer}>
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
                          <Text style={[styles.infoValue, { color: colors.text }]}>
                            {user?.identifier || 'User'}
                          </Text>
                          <TouchableOpacity onPress={handleEditUsername} activeOpacity={0.7}>
                            <Text style={styles.editLink}>edit</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email:</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{USER_EMAIL}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone Number:</Text>
                    <View style={styles.infoValueContainer}>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{USER_PHONE}</Text>
                      <TouchableOpacity activeOpacity={0.7}>
                        <Text style={styles.editLink}>edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.settingsTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setShowSettings(true)}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingsTileLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                      <SettingsIcon size={20} color={colors.icon} strokeWidth={2} />
                    </View>
                    <Text style={[styles.settingsTileText, { color: colors.text }]}>Settings</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.settingsPage}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setShowSettings(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.backText, { color: colors.primary }]}>{'\u2190'} Back</Text>
                </TouchableOpacity>

                <Text style={[styles.settingsTitle, { color: colors.text }]}>Settings</Text>

                <View style={[styles.themeToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.themeToggleLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                      {theme === 'dark' ? (
                        <Moon size={20} color={colors.icon} strokeWidth={2} />
                      ) : (
                        <Sun size={20} color={colors.icon} strokeWidth={2} />
                      )}
                    </View>
                    <Text style={[styles.themeToggleText, { color: colors.text }]}>Dark Theme</Text>
                  </View>
                  <Switch
                    value={theme === 'dark'}
                    onValueChange={toggleTheme}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.background}
                  />
                </View>
              </View>
            )}
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
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  earningsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    width: '100%',
  },
  earningBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  earningValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 6,
  },
  earningLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  infoSection: {
    width: '100%',
    gap: 16,
  },
  infoRow: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 16,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
  },
  settingsTileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsTileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingsPage: {
    padding: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
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
