import { sessionStorage } from '@/lib/sessionStorage';

export const authService = {
  async getAuthToken(): Promise<string | null> {
    const session = await sessionStorage.getSession();
    return session?.auth_token ?? null;
  },

  async getUserId(): Promise<string | null> {
    const session = await sessionStorage.getSession();
    return session?.id ?? null;
  },

  async isAuthenticated(): Promise<boolean> {
    const isValid = await sessionStorage.isSessionValid();
    const token = await this.getAuthToken();
    return isValid && !!token;
  },
};
