import {
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Settings, Bell, Bookmark, Heart, Clock, ChevronLeft, Moon, Sun } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const MENU_ITEMS = [
  { id: '1', icon: Bookmark, label: 'Saved Videos', count: '12' },
  { id: '2', icon: Heart, label: 'Liked Videos', count: '45' },
  { id: '3', icon: Clock, label: 'Watch History', count: '234' },
  { id: '4', icon: Bell, label: 'Notifications', count: '3' },
  { id: '5', icon: Settings, label: 'Settings', count: null },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, colors, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={28} color={colors.icon} strokeWidth={2} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.appName, { color: colors.text }]}>Account</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Manage your account</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.profileSection, { borderBottomColor: colors.borderLight }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary, borderColor: colors.background }]}>
              <Text style={[styles.avatarText, { color: theme === 'dark' ? colors.background : colors.background }]}>U</Text>
            </View>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>User Name</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>user@example.com</Text>
        </View>

        <View style={styles.menuSection}>
          <View style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                {theme === 'dark' ? (
                  <Moon size={22} color={colors.icon} strokeWidth={2} />
                ) : (
                  <Sun size={22} color={colors.icon} strokeWidth={2} />
                )}
              </View>
              <Text style={[styles.menuItemLabel, { color: colors.text }]}>Dark Theme</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.background}
            />
          </View>

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity key={item.id} style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]} activeOpacity={0.7}>
                <View style={styles.menuItemLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                    <Icon size={22} color={colors.icon} strokeWidth={2} />
                  </View>
                  <Text style={[styles.menuItemLabel, { color: colors.text }]}>{item.label}</Text>
                </View>
                {item.count && (
                  <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.countText, { color: theme === 'dark' ? colors.background : colors.background }]}>{item.count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme === 'dark' ? '#7f1d1d' : '#FEE2E2', borderColor: theme === 'dark' ? '#991b1b' : '#FECACA' }]} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  menuSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  countBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
});
