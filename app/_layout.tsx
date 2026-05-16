import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { QueryProvider } from '@/contexts/QueryProvider';
import { appUsageStorage } from '@/lib/appUsageStorage';

function RootNavigator() {
  const { theme } = useTheme();

  useEffect(() => {
    const stopTracking = appUsageStorage.startTracking();
    return stopTracking;
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />
        <Stack.Screen
          name="(tabs)"
          options={{
            gestureEnabled: false,
            animation: 'none',
          }}
        />
        <Stack.Screen name="settings" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <QueryProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </QueryProvider>
  );
}
