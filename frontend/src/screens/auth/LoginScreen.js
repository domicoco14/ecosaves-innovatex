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

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginApi = useAuthStore((state) => state.loginApi);
  const loginMock = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const handleLogin = async () => {
    const em = email.trim() || 'dominion@ecosaves.ng';
    const pw = password || 'password123';

    try {
      await loginApi(em, pw);
      return;
    } catch (err) {
      console.log('Using mock login for local testing');
    }

    loginMock(
      { name: 'Dominion Akinsola', email: em, first_name: 'Dominion', last_name: 'Akinsola', blaze_linked: true, blaze_account_number: '1441002006858' },
      'mock-jwt-token-99999'
    );
  };

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
              placeholder="dominion@ecosaves.ng"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <InputField
              label="Password or PIN"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.forgotWrapper}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
              🔒 256-Bit SSL Encrypted • Ecobank Pan-African Network Partner
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
  loginActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#005B7F',
    borderRadius: 14,
    height: 52,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#E6F3F7',
    borderWidth: 1,
    borderColor: '#005B7F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricBtnText: {
    fontSize: 24,
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
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 20, 30, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  fingerprintCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6F3F7',
    borderWidth: 2,
    borderColor: '#005B7F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  fingerprintEmoji: {
    fontSize: 32,
  },
  modalTitleCenter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#161C20',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubCenter: {
    fontSize: 13,
    color: '#737980',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  cancelModalBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#737980',
  },
});
