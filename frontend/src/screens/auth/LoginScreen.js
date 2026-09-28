import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [invalidField, setInvalidField] = useState(null); // 'email' | 'password' | null

  const loginApi = useAuthStore((state) => state.loginApi);
  const isLoading = useAuthStore((state) => state.isLoading);
  const backendError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (validationError) {
      setValidationError('');
      setInvalidField(null);
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (validationError) {
      setValidationError('');
      setInvalidField(null);
    }
  };

  const handleLogin = async () => {
    const em = email.trim();
    const pw = password;

    if (!em) {
      setValidationError('Please enter your email address.');
      setInvalidField('email');
      return;
    }
    if (!EMAIL_REGEX.test(em)) {
      setValidationError('Please enter a valid email address.');
      setInvalidField('email');
      return;
    }
    if (!pw) {
      setValidationError('Please enter your password.');
      setInvalidField('password');
      return;
    }

    setValidationError('');
    setInvalidField(null);
    clearError();

    try {
      await loginApi(em, pw);
      // loginApi already sets isAuthenticated + user + token on success —
      // navigation onward is handled by your auth-gated navigator, not here.
    } catch (err) {
      // Real failure — wrong credentials, account not found, network error, etc.
      // backendError is already set in the store from the actual response.
      // Do NOT fall back to a mock/logged-in state here.
    }
  };

  const displayedError = validationError || backendError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <EcoSavesLogo variant="badge" />

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in to your EcoSaves account</Text>

          <View style={styles.form}>
            <InputField
              label="Email address"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
              inputStyle={invalidField === 'email' ? styles.inputError : null}
            />

            <InputField
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={handlePasswordChange}
              inputStyle={invalidField === 'password' ? styles.inputError : null}
            />

            <TouchableOpacity style={styles.forgotWrapper}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
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
            title="Log In"
            loading={isLoading}
            style={styles.primaryButton}
            onPress={handleLogin}
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
              256-Bit SSL Encrypted • Ecobank Pan-African Network Partner
            </Text>
          </View>
        </View>
      </ScrollView>
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
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    justifyContent: 'space-between',
  },
  content: {
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#737980',
    marginBottom: 24,
  },
  form: {
    marginTop: 4,
  },
  inputError: {
    borderColor: '#E05252',
    borderWidth: 1.5,
  },
  forgotWrapper: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 20,
  },
  forgotText: {
    color: '#005B7F',
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#005B7F',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signupPrefix: {
    fontSize: 14,
    color: '#737980',
  },
  signupLink: {
    fontSize: 14,
    color: '#005B7F',
    fontWeight: '700',
  },
  securityFooter: {
    alignItems: 'center',
    marginTop: 4,
  },
  securityFooterText: {
    fontSize: 11,
    color: '#737980',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEE9E9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#C0392B',
  },
});