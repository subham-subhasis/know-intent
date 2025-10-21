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
import { X, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import countryCodes from '@/assets/json/country-codes.json';

export default function SignupPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(true);
  const [countryCode, setCountryCode] = useState('+91');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
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
                  {showEmailInput ? (
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.input}
                        placeholder="email@example.com"
                        placeholderTextColor="#9CA3AF"
                        value={emailAddress}
                        onChangeText={setEmailAddress}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      {emailAddress ? (
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
                  ) : (
                    <View style={styles.phoneInputContainer}>
                      <TouchableOpacity
                        style={styles.countryCodeButton}
                        onPress={() => setShowCountryPicker(!showCountryPicker)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.countryCodeText}>{countryCode}</Text>
                        <ChevronDown size={16} color="#6B7280" strokeWidth={2} />
                      </TouchableOpacity>

                      <View style={styles.phoneInputWrapper}>
                        <TextInput
                          style={styles.phoneInput}
                          placeholder="1234567890"
                          placeholderTextColor="#9CA3AF"
                          value={phoneNumber}
                          onChangeText={setPhoneNumber}
                          keyboardType="phone-pad"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        {phoneNumber ? (
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
                    </View>
                  )}

                  {showCountryPicker && !showEmailInput && (
                    <ScrollView style={styles.countryPickerContainer} nestedScrollEnabled>
                      {countryCodes.map((item) => (
                        <TouchableOpacity
                          key={item.code + item.country}
                          style={[
                            styles.countryItem,
                            countryCode === item.code && styles.countryItemSelected
                          ]}
                          onPress={() => {
                            setCountryCode(item.code);
                            setShowCountryPicker(false);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.countryFlag}>{item.flag}</Text>
                          <Text style={styles.countryName}>{item.country}</Text>
                          <Text style={styles.countryCode}>{item.code}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

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
  phoneInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  countryCodeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  phoneInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  phoneInput: {
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
  countryPickerContainer: {
    maxHeight: 250,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryItemSelected: {
    backgroundColor: '#F3F4F6',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
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
