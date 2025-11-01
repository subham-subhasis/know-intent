import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function DateOfBirthPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [showPicker, setShowPicker] = useState(false);
  const [tempMonth, setTempMonth] = useState(today.getMonth());
  const [tempYear, setTempYear] = useState(today.getFullYear());
  const [tempDay, setTempDay] = useState(today.getDate());
  const [error, setError] = useState('');
  const router = useRouter();

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleConfirmDate = () => {
    const newDate = new Date(tempYear, tempMonth, tempDay);
    setSelectedDate(newDate);
    setShowPicker(false);
    setError('');
  };

  const handleNext = () => {
    setError('');
    router.push('/signup/kpiselection');
  };

  const handleBackToLogin = () => {
    router.push('/');
  };

  const renderDayPicker = () => {
    const daysInMonth = getDaysInMonth(tempMonth, tempYear);
    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <TouchableOpacity
          key={i}
          style={[styles.pickerItem, tempDay === i && styles.pickerItemSelected]}
          onPress={() => setTempDay(i)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pickerItemText, tempDay === i && styles.pickerItemTextSelected]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
        {days}
      </ScrollView>
    );
  };

  const renderMonthPicker = () => {
    return (
      <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
        {MONTHS.map((month, index) => (
          <TouchableOpacity
            key={month}
            style={[styles.pickerItem, tempMonth === index && styles.pickerItemSelected]}
            onPress={() => setTempMonth(index)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pickerItemText, tempMonth === index && styles.pickerItemTextSelected]}>
              {month}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderYearPicker = () => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let i = currentYear; i >= 1900; i--) {
      years.push(
        <TouchableOpacity
          key={i}
          style={[styles.pickerItem, tempYear === i && styles.pickerItemSelected]}
          onPress={() => setTempYear(i)}
          activeOpacity={0.7}
        >
          <Text style={[styles.pickerItemText, tempYear === i && styles.pickerItemTextSelected]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
        {years}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/intent-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>KnowIntent</Text>
          <Text style={styles.tagline}>Scroll. Learn. Inspire.</Text>
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowPicker(!showPicker)}
              activeOpacity={0.8}
            >
              <Calendar size={20} color="#6B7280" strokeWidth={2} />
              <Text style={styles.dateButtonText}>
                {selectedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerHeaderText}>Select Date</Text>
                </View>

                <View style={styles.pickerRow}>
                  {renderDayPicker()}
                  {renderMonthPicker()}
                  {renderYearPicker()}
                </View>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirmDate}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.button}
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
    </View>
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  pickerHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  pickerRow: {
    flexDirection: 'row',
    height: 200,
    gap: 8,
    marginBottom: 16,
  },
  pickerColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemSelected: {
    backgroundColor: '#1F2937',
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  pickerItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#4B5563',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
