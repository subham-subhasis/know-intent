import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@intent_session';
const USER_KEY = '@intent_user';

export interface SessionData {
  uid: string;
  session_id: string;
  identifier: string;
  profile_id?: string;
  timestamp: number;
}

export interface UserData {
  uid: string;
  identifier: string;
  profile_id?: string;
  profile_image_url?: string;
  email?: string;
  phone_number?: string;
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

  async updateUserProfileImage(imageUrl: string): Promise<void> {
    try {
      const user = await this.getUser();
      if (user) {
        user.profile_image_url = imageUrl;
        await this.saveUser(user);
      }
    } catch (error) {
      console.error('Failed to update profile image:', error);
    }
  },

  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([SESSION_KEY, USER_KEY]);
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
