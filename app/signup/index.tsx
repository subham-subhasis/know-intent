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

export default function SignupPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const spinValue = useRef(new Animated.Value(0)).current;

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleNext = () => {
    setError('');

    if (showEmailInput) {
      if (!emailAddress.trim()) {
        setError('Please enter your email address');
        return;
      }
      if (!validateEmail(emailAddress)) {
        setError('Please enter a valid email address');
        return;
      }
      router.push('/signup/password');
    } else {
      if (!phoneNumber.trim()) {
        setError('Please enter your phone number');
        return;
      }
      if (!validatePhoneNumber(phoneNumber)) {
        setError('Please enter a valid phone number');
        return;
      }
      router.push('/signup/password');
    }
  };

  const handleSwitchToEmail = () => {
    setShowEmailInput(true);
    setError('');
  };

  const handleSwitchToPhone = () => {
    setShowEmailInput(false);
    setError('');
  };

  const handleClear = () => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0);
    });

    if (showEmailInput) {
      setEmailAddress('');
    } else {
      setPhoneNumber('');
    }
    setError('');
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleBackToLogin = () => {
    router.back();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

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
                  <Text style={styles.title}>
                    {showEmailInput ? "What's your email address?" : "What's your mobile number?"}
                  </Text>
                  <Text style={styles.infoText}>
                    {showEmailInput
                      ? 'Enter the email address where people can connect. We will make sure this is not visible on your profile.'
                      : 'Enter the mobile number on which people can connect. We will make sure this is not visible on your profile.'}
                  </Text>
                </View>

                <View style={styles.inputSection}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder={showEmailInput ? 'email@example.com' : '+1 234 567 8900'}
                      placeholderTextColor="#9CA3AF"
                      value={showEmailInput ? emailAddress : phoneNumber}
                      onChangeText={showEmailInput ? setEmailAddress : setPhoneNumber}
                      keyboardType={showEmailInput ? 'email-address' : 'phone-pad'}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {(showEmailInput ? emailAddress : phoneNumber) ? (
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClear}
                        activeOpacity={0.7}
                      >
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
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
                    (showEmailInput ? !emailAddress : !phoneNumber) && styles.buttonDisabled
                  ]}
                  disabled={showEmailInput ? !emailAddress : !phoneNumber}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>

                {showEmailInput ? (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleSwitchToPhone}
                  >
                    <Text style={styles.secondaryButtonText}>Sign up with mobile number</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleSwitchToEmail}
                  >
                    <Text style={styles.secondaryButtonText}>Sign up with email address</Text>
                  </TouchableOpacity>
                )}

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
