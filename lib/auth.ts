import { signUp, signIn, confirmSignIn, signOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

export interface SignUpParams {
  username: string;
  password: string;
  email?: string;
  phone?: string;
}

export interface SignInParams {
  username: string;
}

export interface VerifyOTPParams {
  otp: string;
}

export const authService = {
  async signUp({ username, password, email, phone }: SignUpParams) {
    try {
      const attributes: Record<string, string> = {};

      if (email) {
        attributes.email = email;
      }

      if (phone) {
        attributes.phone_number = phone.startsWith('+') ? phone : `+91${phone}`;
      }

      const result = await signUp({
        username,
        password,
        options: {
          userAttributes: attributes,
        },
      });

      return {
        success: true,
        userId: result.userId,
        nextStep: result.nextStep,
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error.message || 'Sign up failed',
      };
    }
  },

  async initiateAuth({ username }: SignInParams) {
    try {
      const result = await signIn({
        username,
        options: {
          authFlowType: 'CUSTOM_WITH_SRP',
        },
      });

      return {
        success: true,
        nextStep: result.nextStep,
        challengeName: result.nextStep.signInStep,
      };
    } catch (error: any) {
      console.error('Initiate auth error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  },

  async verifyOTP({ otp }: VerifyOTPParams) {
    try {
      const result = await confirmSignIn({
        challengeResponse: otp,
      });

      return {
        success: true,
        isSignedIn: result.isSignedIn,
        nextStep: result.nextStep,
      };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        error: error.message || 'Invalid OTP',
      };
    }
  },

  async signOut() {
    try {
      await signOut();
      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Sign out failed',
      };
    }
  },

  async getCurrentUser() {
    try {
      const user = await getCurrentUser();
      return {
        success: true,
        user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getSession() {
    try {
      const session = await fetchAuthSession();
      return {
        success: true,
        session,
        tokens: session.tokens,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  },
};
