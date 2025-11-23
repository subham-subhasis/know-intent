import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@intent_session';
const USER_KEY = '@intent_user';

export interface SessionData {
  id: string;
  username: string;
  auth_token: string;
  timestamp: number;
}

export interface UserData {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  first_name: string;
  last_name: string;
  profile_pic_url?: string;
  kpis?: string[];
  gender?: string;
  date_of_birth?: string;
  meta?: any;
}

export const sessionStorage = {
  async saveSession(data: SessionData): Promise<void> {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  async getSession(): Promise<SessionData | null> {
    try {
      const data = await AsyncStorage.getItem(SESSION_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  },

  async saveUser(data: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  },

  async getUser(): Promise<UserData | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  },

  async updateUser(updates: Partial<UserData>): Promise<void> {
    try {
      const user = await this.getUser();
      if (user) {
        const updatedUser = { ...user, ...updates };
        await this.saveUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  },

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([SESSION_KEY, USER_KEY]);
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  },

  async isSessionValid(): Promise<boolean> {
    const session = await this.getSession();
    if (!session) return false;

    const dayInMs = 24 * 60 * 60 * 1000;
    const sessionAge = Date.now() - session.timestamp;

    return sessionAge < 30 * dayInMs;
  },
};
