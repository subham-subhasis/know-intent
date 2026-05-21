import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, Search, User, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const { colors, theme } = useTheme();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        tabBarItemStyle: styles.tabItem,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.icon,
        tabBarInactiveTintColor: colors.iconInactive,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconButton,
              {
                backgroundColor: focused ? colors.primary : colors.surface,
                borderColor: colors.tabBar,
              },
            ]}>
              <Home
                size={22}
                color={focused ? (theme === 'dark' ? colors.background : '#FFFFFF') : color}
                strokeWidth={2.3}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconButton,
              { backgroundColor: focused ? colors.primary : colors.surface, borderColor: colors.tabBar }
            ]}>
              <Search size={22} color={focused ? (theme === 'dark' ? colors.background : '#FFFFFF') : color} strokeWidth={2.5} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="compose-entry"
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.push('/compose');
          },
        }}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={[
                styles.iconButton,
                {
                  backgroundColor: focused ? colors.primary : colors.surface,
                  borderColor: colors.tabBar,
                },
              ]}
            >
              <Plus
                size={22}
                color={focused ? (theme === 'dark' ? colors.background : '#FFFFFF') : color}
                strokeWidth={2.8}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconButton,
              {
                backgroundColor: focused ? colors.primary : colors.surface,
                borderColor: colors.tabBar,
              },
            ]}>
              <User
                size={22}
                color={focused ? (theme === 'dark' ? colors.background : '#FFFFFF') : color}
                strokeWidth={2.3}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 78 : 68,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 18 : 10,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
});
