import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SignupScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [invalidField, setInvalidField] = useState(null); // 'firstName' | 'lastName' | 'email' | null

  const requestOtp = useAuthStore((state) => state.requestOtp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const backendError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const handleFirstNameChange = (text) => {
    setFirstName(text);
    if (validationError) {
      setValidationError('');
      setInvalidField(null);
    }
  };

  const handleLastNameChange = (text) => {
    setLastName(text);
    if (validationError) {
      setValidationError('');
      setInvalidField(null);
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    if (validationError) {
      setValidationError('');
      setInvalidField(null);
    }
  };

  const handleNext = async () => {
    if (!firstName.trim()) {
      setValidationError('Please enter your first name.');
      setInvalidField('firstName');
      return;
    }
    if (!lastName.trim()) {
      setValidationError('Please enter your last name.');
      setInvalidField('lastName');
      return;
    }
    if (!email.trim()) {
      setValidationError('Please enter your email address.');
      setInvalidField('email');
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setValidationError('Please enter a valid email address.');
      setInvalidField('email');
      return;
    }

    setValidationError('');
    setInvalidField(null);
    clearError();

    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();

    try {
      await requestOtp(em);
      // Only advance once the backend has actually sent the OTP.
      navigation.navigate('VerifyEmail', {
        email: em,
        firstName: fn,
        lastName: ln,
      });
    } catch (err) {
      // requestOtp() already set `backendError` in the store from the backend's
      // response (err.response.data.detail) — e.g. "email already registered".
      // Stay on this screen so the user sees it instead of moving on.
    }
  };

  // A single message: local validation takes priority over a stale backend error.
  const displayedError = validationError || backendError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <EcoSavesLogo variant="badge" />

          <Text style={styles.title}>Get Started</Text>
          <Text style={styles.subtitle}>Create a new account</Text>

          <View style={styles.form}>
            <InputField
              label="First name"
              placeholder="John"
              value={firstName}
              onChangeText={handleFirstNameChange}
              inputStyle={invalidField === 'firstName' ? styles.inputError : null}
            />

            <InputField
              label="Last name"
              placeholder="Doe"
              value={lastName}
              onChangeText={handleLastNameChange}
              inputStyle={invalidField === 'lastName' ? styles.inputError : null}
            />

            <InputField
              label="Email address"
              placeholder="johndoe@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={handleEmailChange}
              inputStyle={invalidField === 'email' ? styles.inputError : null}
            />
          </View>

          {displayedError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{displayedError}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Button
            title="Next"
            loading={isLoading}
            style={styles.primaryButton}
            onPress={handleNext}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginPrefix}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
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
    marginBottom: 16,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrefix: {
    fontSize: 14,
    color: '#737980',
  },
  loginLink: {
    fontSize: 14,
    color: '#005B7F',
    fontWeight: '700',
  },
});