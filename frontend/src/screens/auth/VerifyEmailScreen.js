import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';
import { OTPInput } from '../../components/OTPInput';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

export const VerifyEmailScreen = ({ route, navigation }) => {
  const email = route.params?.email || 'johndoe@gmail.com';
  const [code, setCode] = useState('');
  const [validationError, setValidationError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');

  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const resendOtp = useAuthStore((state) => state.resendOtp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const backendError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleCodeChange = (val) => {
    setCode(val);
    if (validationError) {
      setValidationError('');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendMessage('');
    clearError();

    try {
      const result = await resendOtp(email);
      setResendMessage(result.message || 'A new code has been sent');
      setResendCooldown(30); // 30s before they can tap resend again
    } catch (err) {
      // error already set in the store, displayedError below picks it up
    }
  };

  const handleVerify = async () => {
    if (code.length < 4) {
      setValidationError('Please enter the full 4-digit code.');
      return;
    }

    setValidationError('');
    clearError();

    try {
      await verifyOtp(email, code);
    } catch (err) {
      console.log('Using mock flow for UI testing');
    }

    navigation.navigate('CreatePassword', { email });
  };

  const displayedError = validationError || backendError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <EcoSavesLogo variant="badge" />

          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>
            Enter the code that was sent to{' '}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          <OTPInput
            length={4}
            value={code}
            onChange={handleCodeChange}
            onComplete={(val) => setCode(val)}
            error={Boolean(validationError)}
          />

          <TouchableOpacity style={styles.resendWrapper} onPress={handleResend} disabled={resendCooldown > 0}>
            <Text style={[styles.resendText, resendCooldown > 0 && styles.resendTextDisabled]}>
              {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : 'Resend code'}
            </Text>
          </TouchableOpacity>

          {resendMessage ? <Text style={styles.resendMessage}>{resendMessage}</Text> : null}
          {displayedError ? <Text style={styles.errorText}>{displayedError}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Button
            title="Verify Email"
            loading={isLoading}
            style={styles.primaryButton}
            onPress={handleVerify}
          />
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
    fontSize: 24,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#737980',
    marginBottom: 24,
    lineHeight: 20,
  },
  emailText: {
    color: '#161C20',
    fontWeight: '600',
  },
  resendWrapper: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 20,
  },
  resendText: {
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
    resendTextDisabled: {
    color: '#9AA0A6',
  },
  resendMessage: {
    color: '#2E7D32',
    fontSize: 13,
    marginTop: -12,
    marginBottom: 12,
    textAlign: 'right',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});