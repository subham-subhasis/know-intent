import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { signin, getUserProfile } from '@/src/api/userService';
import { ErrorToast } from '@/components/ErrorToast';
import { Info } from 'lucide-react-native';
import { sessionStorage } from '@/lib/sessionStorage';

export default function LandingPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const isValid = await sessionStorage.isSessionValid();
      if (isValid) {
        const session = await sessionStorage.getSession();
        if (session) {
          router.replace('/(tabs)');
          return;
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://intent.app/terms');
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://intent.app/privacy');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleLogin = async () => {
    if (!identifier) return;

    setLoading(true);
    setError('');
    setShowError(false);

    try {
      const result = await signin({
        identifier: identifier,
        otp_verified: true,
        device_info: Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web',
        location_info: 'Unknown',
      });

      if (result.ok) {
        await sessionStorage.saveSession({
          uid: result.uid,
          session_id: result.session_id,
          identifier: identifier,
          timestamp: Date.now(),
        });

        try {
          const profileResult = await getUserProfile({ uid: result.uid });
          if (profileResult.ok) {
            await sessionStorage.saveUser({
              uid: profileResult.uid,
              identifier: profileResult.identifier,
              profile_id: profileResult.profile_id,
              profile_image_url: profileResult.profile_image_url,
              email: profileResult.email,
              phone_number: profileResult.phone_number,
            });
          } else {
            await sessionStorage.saveUser({
              uid: result.uid,
              identifier: identifier,
            });
          }
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError);
          await sessionStorage.saveUser({
            uid: result.uid,
            identifier: identifier,
          });
        }

        router.replace('/(tabs)');
      } else {
        setError('Unable to sign in. Please check your username or phone number.');
        setShowError(true);
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1F2937" />
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <ErrorToast
          message={error}
          visible={showError}
          onDismiss={() => setShowError(false)}
        />
        <ImageBackground
          source={require('@/assets/images/intent-bg.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.appName}>KnowIntent</Text>
              <Text style={styles.tagline}>Scroll. Learn. Inspire.</Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topSection} />

            <View style={styles.bottomSection}>
              <View style={styles.card}>
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>USERNAME OR PHONE NUMBER</Text>
                  <TextInput
                    style={styles.identifierInput}
                    placeholder="Type details here"
                    placeholderTextColor="#D1D5DB"
                    value={identifier}
                    onChangeText={setIdentifier}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.infoContainer}>
                  <Info size={16} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.infoText}>
                    Namaste <Text style={styles.usernameText}>{identifier || 'Username'}</Text>! Post successful login you can still switch to your preferred profile.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    (loading || !identifier) && styles.buttonDisabled
                  ]}
                  disabled={loading || !identifier}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Login To Intent</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => router.push('/signup')}
                >
                  <Text style={styles.secondaryButtonText}>Setup your Intent</Text>
                </TouchableOpacity>

                <View style={styles.legalContainer}>
                  <Text style={styles.legalText}>by proceeding you agree to our </Text>
                  <TouchableOpacity onPress={handleOpenTerms}>
                    <Text style={styles.legalLink}>terms of use</Text>
                  </TouchableOpacity>
                  <Text style={styles.legalText}> & </Text>
                  <TouchableOpacity onPress={handleOpenPrivacy}>
                    <Text style={styles.legalLink}>privacy policy</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  tagline: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  topSection: {
    flex: 1,
    minHeight: 300,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 2,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  inputSection: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginBottom: 12,
    textAlign: 'center',
  },
  identifierInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 0.5,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    fontWeight: '400',
    marginLeft: 8,
  },
  usernameText: {
    fontWeight: '600',
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  legalContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalText: {
    fontSize: 11,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  legalLink: {
    fontSize: 11,
    color: '#4B5563',
    textDecorationLine: 'underline',
    lineHeight: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
