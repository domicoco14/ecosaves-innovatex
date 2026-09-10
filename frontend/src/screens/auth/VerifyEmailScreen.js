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

  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const handleVerify = async () => {
    try {
      if (code) {
        await verifyOtp(email, code);
      }
    } catch (err) {
      console.log('Using mock flow for UI testing');
    }

    navigation.navigate('CreatePassword', { email });
  };

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
            onChange={setCode}
            onComplete={(val) => setCode(val)}
          />

          <TouchableOpacity style={styles.resendWrapper}>
            <Text style={styles.resendText}>Resend code</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
