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

export default function DateOfBirthPage() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const spinValueDay = useRef(new Animated.Value(0)).current;
  const spinValueMonth = useRef(new Animated.Value(0)).current;
  const spinValueYear = useRef(new Animated.Value(0)).current;

  const validateDate = (): boolean => {
    setError('');

    if (!day.trim() || !month.trim() || !year.trim()) {
      setError('Please enter your complete date of birth');
      return false;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
      setError('Please enter valid numbers');
      return false;
    }

    if (dayNum < 1 || dayNum > 31) {
      setError('Day must be between 1 and 31');
      return false;
    }

    if (monthNum < 1 || monthNum > 12) {
      setError('Month must be between 1 and 12');
      return false;
    }

    const currentYear = new Date().getFullYear();
    if (yearNum < 1900 || yearNum > currentYear) {
      setError(`Year must be between 1900 and ${currentYear}`);
      return false;
    }

    const age = currentYear - yearNum;
    if (age < 13) {
      setError('You must be at least 13 years old');
      return false;
    }

    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    if (dayNum > daysInMonth) {
      setError(`Invalid day for the selected month`);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateDate()) {
    }
  };

  const handleBackToLogin = () => {
    router.push('/');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleDayChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 2) {
      setDay(cleaned);
    }
  };

  const handleMonthChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 2) {
      setMonth(cleaned);
    }
  };

  const handleYearChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 4) {
      setYear(cleaned);
    }
  };

  const handleClearDay = () => {
    spinValueDay.setValue(0);
    Animated.timing(spinValueDay, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      spinValueDay.setValue(0);
    });
    setDay('');
    setError('');
  };

  const handleClearMonth = () => {
    spinValueMonth.setValue(0);
    Animated.timing(spinValueMonth, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      spinValueMonth.setValue(0);
    });
    setMonth('');
    setError('');
  };

  const handleClearYear = () => {
    spinValueYear.setValue(0);
    Animated.timing(spinValueYear, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      spinValueYear.setValue(0);
    });
    setYear('');
    setError('');
  };

  const spinDay = spinValueDay.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinMonth = spinValueMonth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinYear = spinValueYear.interpolate({
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

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topSection} />

            <View style={styles.bottomSection}>
              <View style={styles.card}>
                <View style={styles.titleSection}>
                  <Text style={styles.title}>What's your date of birth?</Text>
                  <Text style={styles.infoText}>
                    Use your own date of birth even if it's for business or intended user is someone else.{' '}
                    <Text style={styles.boldText}>
                      While creating a profile under it, we will ask the same question again to show relevant suggestions after successful login.
                    </Text>
                  </Text>
                </View>

                <View style={styles.dateInputContainer}>
                  <View style={styles.dateInputWrapper}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="DD"
                      placeholderTextColor="#9CA3AF"
                      value={day}
                      onChangeText={handleDayChange}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                    {day ? (
                      <TouchableOpacity
                        style={styles.dateClearButton}
                        onPress={handleClearDay}
                        activeOpacity={0.7}
                      >
                        <Animated.View style={{ transform: [{ rotate: spinDay }] }}>
                          <X size={16} color="#6B7280" strokeWidth={2.5} />
                        </Animated.View>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <Text style={styles.dateSeparator}>/</Text>
                  <View style={styles.dateInputWrapper}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="MM"
                      placeholderTextColor="#9CA3AF"
                      value={month}
                      onChangeText={handleMonthChange}
                      keyboardType="number-pad"
                      maxLength={2}
                    />
                    {month ? (
                      <TouchableOpacity
                        style={styles.dateClearButton}
                        onPress={handleClearMonth}
                        activeOpacity={0.7}
                      >
                        <Animated.View style={{ transform: [{ rotate: spinMonth }] }}>
                          <X size={16} color="#6B7280" strokeWidth={2.5} />
                        </Animated.View>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  <Text style={styles.dateSeparator}>/</Text>
                  <View style={[styles.dateInputWrapper, styles.yearInputWrapper]}>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="YYYY"
                      placeholderTextColor="#9CA3AF"
                      value={year}
                      onChangeText={handleYearChange}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                    {year ? (
                      <TouchableOpacity
                        style={styles.dateClearButton}
                        onPress={handleClearYear}
                        activeOpacity={0.7}
                      >
                        <Animated.View style={{ transform: [{ rotate: spinYear }] }}>
                          <X size={16} color="#6B7280" strokeWidth={2.5} />
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
                    (!day || !month || !year) && styles.buttonDisabled
                  ]}
                  disabled={!day || !month || !year}
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
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  topSection: {
    flex: 1,
    minHeight: 300,
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
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dateInputWrapper: {
    flex: 1,
    maxWidth: 80,
    position: 'relative',
  },
  yearInputWrapper: {
    maxWidth: 120,
  },
  dateInput: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  dateClearButton: {
    position: 'absolute',
    right: 4,
    top: '50%',
    transform: [{ translateY: -8 }],
    padding: 2,
    zIndex: 1,
  },
  dateSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9CA3AF',
    marginHorizontal: 8,
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
