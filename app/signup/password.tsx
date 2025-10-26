import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ImageBackground,
  Animated,
} from 'react-native';
import { useState, useRef } from 'react';
import { X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { signupStorage } from '@/lib/signupStorage';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const spinValuePassword = useRef(new Animated.Value(0)).current;
  const spinValueConfirm = useRef(new Animated.Value(0)).current;

  const validatePassword = (): boolean => {
    setError('');

    if (!password.trim()) {
      setError('Please enter a password');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!confirmPassword.trim()) {
      setError('Please confirm your password');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validatePassword()) {
      signupStorage.setData('password', password);
      router.push('/signup/dateofbirth');
    }
  };

  const handleBackToLogin = () => {
    router.push('/');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleClearPassword = () => {
    spinValuePassword.setValue(0);
    Animated.timing(spinValuePassword, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      spinValuePassword.setValue(0);
    });
    setPassword('');
    setError('');
  };

  const handleClearConfirmPassword = () => {
    spinValueConfirm.setValue(0);
    Animated.timing(spinValueConfirm, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      spinValueConfirm.setValue(0);
    });
    setConfirmPassword('');
    setError('');
  };

  const spinPassword = spinValuePassword.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinConfirm = spinValueConfirm.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
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
              <Text style={styles.appName}>Intent</Text>
              <Text style={styles.tagline}>Scroll. Learn. Inspire.</Text>
            </View>
          </View>

          <View style={styles.contentWrapper}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.card}>
                <View style={styles.titleSection}>
                  <Text style={styles.title}>Create your password</Text>
                  <Text style={styles.infoText}>
                    Create a password at least six letters or numbers. Its should be something which others can not guess.{' '}
                    <Text style={styles.boldText}>Make it as strong as you are.</Text>
                  </Text>
                </View>

                <View style={styles.inputSection}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {password ? (
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearPassword}
                        activeOpacity={0.7}
                      >
                        <Animated.View style={{ transform: [{ rotate: spinPassword }] }}>
                          <X size={20} color="#6B7280" strokeWidth={2.5} />
                        </Animated.View>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                <View style={styles.inputSection}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {confirmPassword ? (
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearConfirmPassword}
                        activeOpacity={0.7}
                      >
                        <Animated.View style={{ transform: [{ rotate: spinConfirm }] }}>
                          <X size={20} color="#6B7280" strokeWidth={2.5} />
                        </Animated.View>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {error ? <Text style={styles.errorText}>{error}</Text> : null}
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    (!password || !confirmPassword) && styles.buttonDisabled
                  ]}
                  disabled={!password || !confirmPassword}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.loginLinkContainer}
                  onPress={handleBackToLogin}
                >
                  <Text style={styles.loginLinkText}>
                    Already have an account?{' '}
                    <Text style={styles.loginLink}>Login Directly</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 120 : 100,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
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
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 21,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '700',
    color: '#1F2937',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: 4,
    zIndex: 1,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
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
  loginLinkContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    color: '#1F2937',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
