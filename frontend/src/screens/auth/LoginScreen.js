import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';
import { InputField } from '../../components/InputField';
import { PINInput } from '../../components/PINInput';
import { Button } from '../../components/Button';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { KeyboardAwareView } from '../../components/KeyboardAwareView';
import { useAuthStore } from '../../store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
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
      setValidationError('Please enter your 6-digit passcode.');
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

  const handleLoginSubmit = () => performLogin(pin);

  const displayedError = validationError || backendError;
  const canContinue = pin.length === 6 && EMAIL_REGEX.test(email.trim());

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <KeyboardAwareView>
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <EcoSavesLogo variant="badge" />
            <Text style={styles.brandName}>EcoSaves</Text>
          </View>

          <View style={styles.intro}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Securely access your account.</Text>
          </View>

          <View style={styles.form}>
            <InputField
              label="Email address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
            />

            <View style={styles.pinSection}>
              <Text style={styles.fieldLabel}>6-digit passcode</Text>
              <PINInput
                value={pin}
                onChange={handlePinChange}
                length={6}
                error={Boolean(displayedError)}
                autoFocus={false}
              />
            </View>

            <TouchableOpacity style={styles.forgotWrapper} accessibilityRole="button">
              <Text style={styles.forgotText}>Forgot passcode?</Text>
            </TouchableOpacity>
          </View>

          {displayedError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{displayedError}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue"
            loading={isLoading}
            style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
            textStyle={[styles.primaryButtonText, !canContinue && styles.primaryButtonTextDisabled]}
            disabled={!canContinue}
            onPress={handleLoginSubmit}
          />

          <View style={styles.signupRow}>
            <Text style={styles.signupPrefix}>New to EcoSaves?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.securityFooter}>
            <Text style={styles.securityFooterText}>Your account is secure and protected.</Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
      </KeyboardAwareView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#F6F9F9',
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  content: {
    width: '100%',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 42,
  },
  brandName: {
    color: '#00597C',
    fontSize: 17,
    fontWeight: '800',
    marginLeft: 10,
    letterSpacing: 0.1,
  },
  intro: {
    marginBottom: 30,
  },
  title: {
    color: '#161C20',
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 7,
  },
  subtitle: {
    color: '#737980',
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  pinSection: {
    marginTop: 22,
    width: '100%',
  },
  fieldLabel: {
    color: '#27343A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  forgotWrapper: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    marginTop: 2,
  },
  forgotText: {
    color: '#00597C',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    marginTop: 34,
    width: '100%',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#00597C',
    borderRadius: 15,
    height: 56,
    justifyContent: 'center',
    marginVertical: 0,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  primaryButtonDisabled: {
    backgroundColor: '#CBD6DA',
  },
  primaryButtonTextDisabled: {
    color: '#65747A',
  },
  signupRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupPrefix: {
    color: '#737980',
    fontSize: 13,
    marginRight: 5,
  },
  signupLink: {
    color: '#00597C',
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 4,
  },
  securityFooter: {
    alignItems: 'center',
    borderTopColor: '#E8EEEE',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 22,
    paddingTop: 15,
  },
  securityFooterText: {
    color: '#89939A',
    fontSize: 11,
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: '#FEE9E9',
    borderRadius: 10,
    marginTop: 12,
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
