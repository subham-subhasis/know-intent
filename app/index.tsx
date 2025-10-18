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
  Image
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

export default function LandingPage() {
  const [identifier, setIdentifier] = useState('');
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
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>USERNAME OR PHONE NUMBER</Text>
                  <TextInput
                    style={styles.identifierInput}
                    placeholder=""
                    placeholderTextColor="#D1D5DB"
                    value={identifier}
                    onChangeText={setIdentifier}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoCorrect={false}
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
                    (!identifier || !agreedToTerms) && styles.buttonDisabled
                  ]}
                  disabled={!identifier || !agreedToTerms}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>Login To Intent</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.signupLink}>
                  <Text style={styles.signupText}>Setup your Intent</Text>
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
    fontSize: 32,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
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
  signupLink: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  signupText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4B5563',
    textDecorationLine: 'underline',
    letterSpacing: 0.2,
  },
});
