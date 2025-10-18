import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function LandingPage() {
  const [inputVisible, setInputVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();

  const handleOpenTerms = () => {
    Linking.openURL('https://intent.app/terms');
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://intent.app/privacy');
  };

  return (
    <LinearGradient
      colors={['#F8F9FA', '#E8EAED', '#D3D6DA']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <View style={styles.topSection}>
        <Text style={styles.appName}>Intent</Text>
        <Text style={styles.tagline}>Scroll. Learn. Inspire.</Text>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.card}>
          <Pressable
            style={styles.inputContainer}
            onPress={() => setInputVisible(true)}
          >
            {!inputVisible ? (
              <Text style={styles.placeholderText}>Enter Username/Phone Number</Text>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Enter Username/Phone Number"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoFocus
                keyboardType="default"
              />
            )}
          </Pressable>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View style={[styles.checkboxBox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              Allow Intent to access your personal information
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            disabled={!username || !agreedToTerms}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Setup your account</Text>
          </TouchableOpacity>

          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>By proceeding you agree to our </Text>
            <TouchableOpacity onPress={handleOpenTerms}>
              <Text style={styles.legalLink}>terms of use</Text>
            </TouchableOpacity>
            <Text style={styles.legalText}> and </Text>
            <TouchableOpacity onPress={handleOpenPrivacy}>
              <Text style={styles.legalLink}>privacy policy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  bottomSection: {
    flex: 3,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 56,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  input: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    outlineStyle: 'none',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
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
    color: '#1F2937',
    textDecorationLine: 'underline',
    lineHeight: 16,
    fontWeight: '500',
  },
});
