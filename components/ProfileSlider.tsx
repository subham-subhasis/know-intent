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
import { X, DollarSign, Coins, Camera, Image as ImageIcon, Check, Settings as SettingsIcon, Moon, Sun, LogOut, Clock, Edit2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { sessionStorage } from '@/lib/sessionStorage';
import { getPresignedUrl, updateProfileImage, updateUsername } from '@/src/api/userService';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProfileSliderProps {
  visible: boolean;
  onClose: () => void;
}

const USER_PHONE = '-';
const USER_EMAIL = 'Subham470@gmail.com';

export function ProfileSlider({ visible, onClose }: ProfileSliderProps) {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [isEditingUID, setIsEditingUID] = useState(false);
  const [newUID, setNewUID] = useState('');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
    setNewUID(userData?.uid || '');
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

  const handleEditUID = () => {
    setIsEditingUID(true);
  };

  const handleSaveUID = async () => {
    if (!user || !newUID.trim() || newUID === user.uid) {
      setIsEditingUID(false);
      return;
    }

    setUpdating(true);
    try {
      const result = await updateUsername({
        current_uid: user.uid,
        new_username: newUID.trim(),
      });

      if (result.ok) {
        const updatedUser = { ...user, uid: result.uid };
        await sessionStorage.saveUser(updatedUser);
        await loadUser();
        setIsEditingUID(false);
      } else {
        Alert.alert('Update Failed', 'Unable to update User Name. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update User Name');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogoutPress = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await sessionStorage.clearSession();
      setShowLogoutConfirm(false);
      onClose();
      router.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
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
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleLogoutPress}
              activeOpacity={0.7}
            >
              <LogOut size={22} color="#DC2626" strokeWidth={2} />
            </TouchableOpacity>
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

                <View style={styles.greetingSection}>
                  {isEditingUID ? (
                    <View style={styles.greetingEditContainer}>
                      <TextInput
                        style={[
                          styles.greetingInput,
                          {
                            color: colors.text,
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          }
                        ]}
                        value={newUID}
                        onChangeText={setNewUID}
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                        onPress={handleSaveUID}
                        disabled={updating}
                        activeOpacity={0.7}
                      >
                        {updating ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.greetingRow}>
                      <Text style={[styles.greetingText, { color: colors.text }]}>
                        Namaste <Text style={styles.greetingName}>{user?.uid || 'User'}</Text>
                      </Text>
                      <TouchableOpacity onPress={handleEditUID} activeOpacity={0.7}>
                        <Edit2 size={16} color={colors.icon} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <View style={styles.earningsRow}>
                  <View style={styles.earningItem}>
                    <DollarSign size={18} color="#10B981" strokeWidth={2.5} />
                    <Text style={[styles.earningText, { color: colors.text }]}>
                      <Text style={styles.earningValue}>0</Text>
                      <Text style={[styles.earningLabel, { color: colors.textSecondary }]}> Earned</Text>
                    </Text>
                  </View>

                  <View style={styles.earningItem}>
                    <Coins size={18} color="#F59E0B" strokeWidth={2.5} />
                    <Text style={[styles.earningText, { color: colors.text }]}>
                      <Text style={styles.earningValue}>0</Text>
                      <Text style={[styles.earningLabel, { color: colors.textSecondary }]}> Intent Coins</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>EMAIL</Text>
                    <Text style={[styles.infoValue, { color: colors.text }]}>{USER_EMAIL}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>PHONE NUMBER</Text>
                    <View style={styles.infoValueContainer}>
                      <Text style={[styles.infoValue, { color: colors.text }]}>{USER_PHONE}</Text>
                      <TouchableOpacity activeOpacity={0.7}>
                        <Edit2 size={14} color={colors.icon} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={[styles.separator, { backgroundColor: colors.border }]} />

                <View style={styles.menuSection}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    activeOpacity={0.7}
                  >
                    <Clock size={20} color={colors.icon} strokeWidth={2} />
                    <Text style={[styles.menuItemText, { color: colors.text }]}>History</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setShowSettings(true)}
                    activeOpacity={0.7}
                  >
                    <SettingsIcon size={20} color={colors.icon} strokeWidth={2} />
                    <Text style={[styles.menuItemText, { color: colors.text }]}>Settings</Text>
                  </TouchableOpacity>
                </View>
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
                  <View style={[styles.menuIconContainer, { backgroundColor: colors.background }]}>
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

        {showLogoutConfirm && (
          <View style={[styles.confirmOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
            <View style={[styles.confirmModal, { backgroundColor: colors.background }]}>
              <Text style={[styles.confirmTitle, { color: colors.text }]}>Confirm Logout</Text>
              <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
                Are you sure, want to logout?
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={handleLogoutCancel}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.logoutButton]}
                  onPress={handleLogoutConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.logoutButtonText}>Yes, Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  greetingSection: {
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1F2937',
  },
  greetingName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  greetingEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  greetingInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
  },
  earningsRow: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
    width: '100%',
  },
  earningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  earningText: {
    fontSize: 15,
    fontWeight: '400',
  },
  earningValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  earningLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
  },
  infoSection: {
    width: '100%',
    gap: 12,
  },
  infoRow: {
    width: '100%',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  menuSection: {
    width: '100%',
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 320,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
