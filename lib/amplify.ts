import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Amplify } from 'aws-amplify';

const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID!,
      signUpVerificationMethod: 'code' as const,
      loginWith: {
        email: true,
        phone: true,
      },
    },
  },
};

Amplify.configure(amplifyConfig);

export default amplifyConfig;
