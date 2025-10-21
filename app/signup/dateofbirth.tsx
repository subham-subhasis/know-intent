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
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DateOfBirthPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day');
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [error, setError] = useState('');
  const router = useRouter();

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newDate);
    setError('');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    setViewMode('day');
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    setViewMode('month');
  };

  const handlePrevious = () => {
    if (viewMode === 'day') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (viewMode === 'year') {
      setCurrentYear(currentYear - 12);
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    } else if (viewMode === 'year') {
      setCurrentYear(currentYear + 12);
    }
  };

  const validateAndProceed = () => {
    setError('');

    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    const dayDiff = today.getDate() - selectedDate.getDate();

    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge--;
    }

    if (actualAge < 13) {
      setError('You must be at least 13 years old');
      return;
    }

    if (selectedDate > today) {
      setError('Date cannot be in the future');
      return;
    }

    router.push('/signup/kpiselection');
  };

  const handleBackToLogin = () => {
    router.push('/');
  };

  const renderDayView = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;

      const isToday =
        today.getDate() === day &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.selectedCell,
            isToday && !isSelected && styles.todayCell
          ]}
          onPress={() => handleDateSelect(day)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedText,
            isToday && !isSelected && styles.todayText
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View>
        <View style={styles.daysOfWeekContainer}>
          {DAYS_OF_WEEK.map(day => (
            <View key={day} style={styles.dayOfWeekCell}>
              <Text style={styles.dayOfWeekText}>{day}</Text>
            </View>
          ))}
        </View>
        <View style={styles.daysGrid}>{days}</View>
      </View>
    );
  };

  const renderMonthView = () => {
    return (
      <View style={styles.monthsGrid}>
        {MONTHS.map((month, index) => {
          const isSelected =
            currentMonth === index &&
            selectedDate.getFullYear() === currentYear;

          return (
            <TouchableOpacity
              key={month}
              style={[styles.monthCell, isSelected && styles.selectedCell]}
              onPress={() => handleMonthSelect(index)}
              activeOpacity={0.7}
            >
              <Text style={[styles.monthText, isSelected && styles.selectedText]}>
                {month.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderYearView = () => {
    const startYear = Math.floor(currentYear / 12) * 12;
    const years = [];

    for (let i = 0; i < 12; i++) {
      const year = startYear + i;
      const isSelected = selectedDate.getFullYear() === year;

      years.push(
        <TouchableOpacity
          key={year}
          style={[styles.yearCell, isSelected && styles.selectedCell]}
          onPress={() => handleYearSelect(year)}
          activeOpacity={0.7}
        >
          <Text style={[styles.yearText, isSelected && styles.selectedText]}>
            {year}
          </Text>
        </TouchableOpacity>
      );
    }

    return <View style={styles.yearsGrid}>{years}</View>;
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
          <Text style={styles.appName}>Intent</Text>
          <Text style={styles.tagline}>Scroll. Learn. Inspire.</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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

            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handlePrevious}
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={24} color="#1F2937" strokeWidth={2} />
                </TouchableOpacity>

                <View style={styles.headerTextContainer}>
                  {viewMode === 'day' && (
                    <>
                      <TouchableOpacity
                        onPress={() => setViewMode('month')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.headerText}>
                          {MONTHS[currentMonth]}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setViewMode('year')}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.headerText}>{currentYear}</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {viewMode === 'month' && (
                    <TouchableOpacity
                      onPress={() => setViewMode('year')}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.headerText}>{currentYear}</Text>
                    </TouchableOpacity>
                  )}
                  {viewMode === 'year' && (
                    <Text style={styles.headerText}>
                      {Math.floor(currentYear / 12) * 12} - {Math.floor(currentYear / 12) * 12 + 11}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handleNext}
                  activeOpacity={0.7}
                >
                  <ChevronRight size={24} color="#1F2937" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {viewMode === 'day' && renderDayView()}
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'year' && renderYearView()}

              <View style={styles.selectedDateContainer}>
                <Text style={styles.selectedDateLabel}>Selected Date:</Text>
                <Text style={styles.selectedDateText}>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.button}
              onPress={validateAndProceed}
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
  calendarContainer: {
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
  },
  headerTextContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayOfWeekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayOfWeekText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 12,
  },
  monthCell: {
    width: '30%',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  yearsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 12,
  },
  yearCell: {
    width: '30%',
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  selectedCell: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  todayCell: {
    borderColor: '#1F2937',
    borderWidth: 2,
  },
  todayText: {
    fontWeight: '700',
  },
  selectedDateContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedDateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  selectedDateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
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
