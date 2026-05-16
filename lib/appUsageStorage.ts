import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

const APP_USAGE_KEY = '@intent_app_usage';

type UsageStore = Record<string, number>;

export interface AppUsageSummaryItem {
  label: string;
  key: string;
  milliseconds: number;
}

export interface AppUsageSummary {
  today: AppUsageSummaryItem;
  yesterday: AppUsageSummaryItem;
  twoDaysAgo: AppUsageSummaryItem;
  weekAverage: AppUsageSummaryItem;
  days: AppUsageSummaryItem[];
}

let activeSince: number | null = null;
let isTracking = false;

const getDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRelativeDayKey = (offset: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - offset);
  return getDayKey(date);
};

const loadUsageStore = async (): Promise<UsageStore> => {
  try {
    const raw = await AsyncStorage.getItem(APP_USAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to load app usage:', error);
    return {};
  }
};

const saveUsageStore = async (store: UsageStore) => {
  try {
    await AsyncStorage.setItem(APP_USAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Failed to save app usage:', error);
  }
};

const flushActiveUsage = async () => {
  if (!activeSince) return;

  const now = Date.now();
  const elapsed = Math.max(0, now - activeSince);
  activeSince = now;

  if (elapsed < 1000) return;

  const todayKey = getDayKey(new Date());
  const store = await loadUsageStore();
  store[todayKey] = (store[todayKey] || 0) + elapsed;
  await saveUsageStore(store);
};

export const appUsageStorage = {
  startTracking() {
    if (isTracking) return () => {};

    isTracking = true;
    activeSince = Date.now();

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        activeSince = Date.now();
        return;
      }

      flushActiveUsage();
      activeSince = null;
    });

    const intervalId = setInterval(flushActiveUsage, 60 * 1000);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
      flushActiveUsage();
      activeSince = null;
      isTracking = false;
    };
  },

  async getSummary(): Promise<AppUsageSummary> {
    await flushActiveUsage();
    const store = await loadUsageStore();

    const days = Array.from({ length: 7 }, (_, offset) => {
      const key = getRelativeDayKey(offset);
      return {
        label: offset === 0 ? 'Today' : offset === 1 ? 'Yesterday' : `T-${offset}`,
        key,
        milliseconds: store[key] || 0,
      };
    });

    const weekAverageMs = days.reduce((total, item) => total + item.milliseconds, 0) / days.length;

    return {
      today: days[0],
      yesterday: days[1],
      twoDaysAgo: days[2],
      weekAverage: {
        label: 'Week Avg',
        key: 'week-average',
        milliseconds: weekAverageMs,
      },
      days,
    };
  },
};
