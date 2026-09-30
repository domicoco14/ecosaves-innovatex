import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';
import { InputField } from '../../components/InputField';
import { PINInput } from '../../components/PINInput';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [useTextPassword, setUseTextPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const loginApi = useAuthStore((state) => state.loginApi);
  const isLoading = useAuthStore((state) => state.isLoading);
  const backendError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (validationError) setValidationError('');
  };

  const handlePinChange = (val) => {
    setPin(val);
    if (validationError) setValidationError('');
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (validationError) setValidationError('');
  };

  const performLogin = async (loginCredential) => {
    const em = email.trim();
    if (!em) {
      setValidationError('Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(em)) {
      setValidationError('Please enter a valid email address.');
      return;
    }
    if (!loginCredential) {
      setValidationError(useTextPassword ? 'Please enter your password.' : 'Please enter your 6-digit passcode.');
      return;
    }

    setValidationError('');
    clearError();

    try {
      await loginApi(em, loginCredential);
    } catch (err) {
      // Error handled in authStore
    }
  };

  const handleLoginSubmit = () => {
    performLogin(useTextPassword ? password : pin);
  };

  // Auto-submit when 6th digit of PIN is entered
  useEffect(() => {
    if (!useTextPassword && pin.length === 6 && EMAIL_REGEX.test(email.trim()) && !isLoading) {
      performLogin(pin);
    }
  }, [pin]);

  const displayedError = validationError || backendError;
  const initials = email ? email.substring(0, 2).toUpperCase() : 'ES';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <KeyboardAvoidingView style={styles.keyboardFrame} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        <View style={styles.content}>
          <View style={styles.topHeader}>
            <EcoSavesLogo variant="badge" />
          </View>

          {/* User Avatar Squircle Badge */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarSquircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {email ? <Text style={styles.emailBadge}>{email.trim()}</Text> : null}
          </View>

          <Text style={styles.title}>Welcome back!</Text>
          <Text style={styles.subtitle}>
            {useTextPassword ? 'Enter your account password' : 'Enter your 6 digit passcode'}
          </Text>

          <View style={styles.form}>
            <InputField
              label="Email address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
            />

            {!useTextPassword ? (
              <View style={styles.pinSection}>
                <Text style={styles.fieldLabel}>6-DIGIT PASSCODE</Text>
                <PINInput
                  value={pin}
                  onChange={handlePinChange}
                  length={6}
                  error={Boolean(displayedError)}
                  autoFocus={Boolean(email)}
                />
              </View>
            ) : (
              <InputField
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={handlePasswordChange}
              />
            )}

            <View style={styles.optionsRow}>
              <TouchableOpacity onPress={() => { setUseTextPassword(!useTextPassword); setPin(''); setPassword(''); }}>
                <Text style={styles.toggleText}>
                  {useTextPassword ? 'Use 6-digit passcode' : 'Use text password'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotWrapper}>
                <Text style={styles.forgotText}>Forgot passcode?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {displayedError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{displayedError}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Button
            title="Log In"
            loading={isLoading}
            style={styles.primaryButton}
            onPress={handleLoginSubmit}
          />

          <View style={styles.signupRow}>
            <Text style={styles.signupPrefix}>New to EcoSaves? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Security Footer */}
          <View style={styles.securityFooter}>
            <Text style={styles.securityFooterText}>
              Protected by EcoSaves Secure Passcode Sign-In
            </Text>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardFrame: { flex: 1 },
  container: {
    flexGrow: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  topHeader: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  avatarSquircle: {
    alignItems: 'center',
    backgroundColor: '#005B7F',
    borderRadius: 22,
    elevation: 3,
    height: 64,
    justifyContent: 'center',
    shadowColor: '#005B7F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: 64,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  emailBadge: {
    backgroundColor: '#E6F3F7',
    borderRadius: 12,
    color: '#005B7F',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  title: {
    color: '#161C20',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: '#737980',
    fontSize: 13,
    marginBottom: 18,
    textAlign: 'center',
  },
  form: {
    marginTop: 4,
    width: '100%',
  },
  pinSection: {
    alignItems: 'center',
    marginTop: 6,
    width: '100%',
  },
  fieldLabel: {
    alignSelf: 'flex-start',
    color: '#737980',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 16,
    width: '100%',
  },
  toggleText: {
    color: '#005B7F',
    fontSize: 12,
    fontWeight: '700',
  },
  forgotWrapper: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: '#005B7F',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    marginTop: 16,
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#005B7F',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
  },
  signupRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 14,
    marginTop: 16,
  },
  signupPrefix: {
    color: '#737980',
    fontSize: 14,
  },
  signupLink: {
    color: '#005B7F',
    fontSize: 14,
    fontWeight: '700',
  },
  securityFooter: {
    alignItems: 'center',
    marginTop: 2,
  },
  securityFooterText: {
    color: '#737980',
    fontSize: 11,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEE9E9',
    borderRadius: 10,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    width: '100%',
  },
  errorText: {
    color: '#C0392B',
    fontSize: 13,
    textAlign: 'center',
  },
});