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
  ActivityIndicator,
} from 'react-native';
import { useState, useRef } from 'react';
import { X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import kpiData from '@/assets/json/kpi.json';
import { signupStorage } from '@/lib/signupStorage';
import { authService } from '@/lib/auth';

export default function KPISelectionPage() {
  const [selectedKPIs, setSelectedKPIs] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const spinValue = useRef(new Animated.Value(0)).current;

  const kpiList = Object.keys(kpiData);

  const toggleKPI = (kpi: string) => {
    setError('');
    setSelectedKPIs(prev => {
      if (prev.includes(kpi)) {
        return prev.filter(item => item !== kpi);
      } else {
        return [...prev, kpi];
      }
    });
  };

  const validateSelection = (): boolean => {
    setError('');

    if (selectedKPIs.length === 0 && !suggestions.trim()) {
      setError('Please select at least one KPI or provide suggestions');
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateSelection()) return;

    setLoading(true);
    setError('');

    try {
      const signupData = signupStorage.getData();

      const result = await authService.signUp({
        username: signupData.emailOrPhone,
        password: signupData.password,
        email: signupData.isEmail ? signupData.emailOrPhone : undefined,
        phone: signupData.isEmail ? undefined : signupData.emailOrPhone,
      });

      if (result.success) {
        const authResult = await authService.initiateAuth({
          username: signupData.emailOrPhone,
        });

        if (authResult.success) {
          router.push({
            pathname: '/signup/verifyotp',
            params: {
              username: signupData.emailOrPhone,
              identifier: signupData.emailOrPhone,
            },
          });
        } else {
          setError(authResult.error || 'Failed to send OTP');
        }
      } else {
        setError(result.error || 'Sign up failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleClearSuggestions = () => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      spinValue.setValue(0);
    });
    setSuggestions('');
    setError('');
  };

  const spin = spinValue.interpolate({
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
                  <Text style={styles.title}>What interests you?</Text>
                  <Text style={styles.infoText}>
                    Select the key performance indicators that matter to you.{' '}
                    <Text style={styles.boldText}>
                      This is crucial as our suggestions will be based on your selection.
                    </Text>{' '}
                    Don't see what you're looking for? Add your own suggestions below.
                  </Text>
                </View>

                <View style={styles.kpiContainer}>
                  {kpiList.map((kpi) => (
                    <TouchableOpacity
                      key={kpi}
                      style={[
                        styles.chip,
                        selectedKPIs.includes(kpi) && styles.chipSelected
                      ]}
                      onPress={() => toggleKPI(kpi)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.chipText,
                        selectedKPIs.includes(kpi) && styles.chipTextSelected
                      ]}>
                        {kpi}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Add your own interests</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Tell us what you'd like to learn about..."
                      placeholderTextColor="#9CA3AF"
                      value={suggestions}
                      onChangeText={setSuggestions}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      autoCapitalize="sentences"
                      autoCorrect={true}
                    />
                    {suggestions ? (
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearSuggestions}
                        activeOpacity={0.7}
                      >
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                          <X size={20} color="#6B7280" strokeWidth={2.5} />
                        </Animated.View>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.button,
                    (loading || (selectedKPIs.length === 0 && !suggestions.trim())) && styles.buttonDisabled
                  ]}
                  disabled={loading || (selectedKPIs.length === 0 && !suggestions.trim())}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>Next</Text>
                  )}
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
    minHeight: 600,
  },
  titleSection: {
    marginBottom: 24,
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
  kpiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  chipSelected: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginHorizontal: 16,
    letterSpacing: 1,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
    textAlign: 'center',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1F2937',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 44,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 100,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
    zIndex: 1,
  },
  errorContainer: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
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
