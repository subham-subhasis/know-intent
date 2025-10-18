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
  ImageBackground
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function LandingPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();

  const handleOpenTerms = () => {
    Linking.openURL('https://intent.app/terms');
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://intent.app/privacy');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setPhoneNumber(cleaned);
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <ImageBackground
          source={{ uri: 'https://images.pexels.com/photos/1290141/pexels-photo-1290141.jpeg' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.overlay} />
        </ImageBackground>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topSection}>
              <Text style={styles.appName}>Intent</Text>
              <Text style={styles.tagline}>Scroll. Learn. Inspire.</Text>
            </View>

            <View style={styles.bottomSection}>
              <View style={styles.card}>
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>YOUR MOBILE NUMBER</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="88955 23032"
                    placeholderTextColor="#D1D5DB"
                    value={phoneNumber}
                    onChangeText={formatPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                  >
                    <View style={[styles.checkboxBox, agreedToTerms && styles.checkboxChecked]} />
                  </TouchableOpacity>
                  <Text style={styles.checkboxText}>
                    allow Intent to access your personal information from{' '}
                    <Text style={styles.underlinedText}>approved sources</Text>
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    (!phoneNumber || !agreedToTerms) && styles.buttonDisabled
                  ]}
                  disabled={!phoneNumber || !agreedToTerms}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Setup your membership</Text>
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
    backgroundColor: '#F5F5F5',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
    paddingTop: 60,
  },
  appName: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '400',
    color: '#F5F5F5',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
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
  phoneInput: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 2,
    paddingVertical: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#1F2937',
    borderColor: '#1F2937',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    fontWeight: '400',
  },
  underlinedText: {
    textDecorationLine: 'underline',
    fontWeight: '500',
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
});
