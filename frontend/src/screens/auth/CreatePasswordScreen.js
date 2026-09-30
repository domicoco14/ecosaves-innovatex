import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

const PIN_RULES = [
  { key: 'length', label: 'Exactly 6 digits', test: (pin) => pin.length === 6 },
  { key: 'numeric', label: 'Numbers only', test: (pin) => /^[0-9]+$/.test(pin) },
];

export const CreatePasswordScreen = ({ route, navigation }) => {
  const email = route.params?.email || 'johndoe@gmail.com';
  const firstName = route.params?.firstName || '';
  const lastName = route.params?.lastName || '';
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [invalidField, setInvalidField] = useState(null); // 'password' | 'confirmPassword' | null

  const completeSignup = useAuthStore((state) => state.completeSignup);
  const isLoading = useAuthStore((state) => state.isLoading);
  const backendError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const ruleResults = useMemo(
    () => PIN_RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password]
  );
  const allRulesPassed = ruleResults.every((rule) => rule.passed);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit = allRulesPassed && passwordsMatch;

  const handlePasswordChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setPasswordState(cleaned);
    if (validationError) {
      setValidationError('');
      setInvalidField(null);
    }
  };

  const handleConfirmPasswordChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    setConfirmPassword(cleaned);
    if (validationError) {
      setValidationError('');
      setInvalidField(null);
    }
  };

  const handleFinish = async () => {
    if (!allRulesPassed) {
      setValidationError('Please enter a valid 6-digit security PIN.');
      setInvalidField('password');
      return;
    }
    if (!confirmPassword.trim()) {
      setValidationError('Please re-enter your 6-digit PIN.');
      setInvalidField('confirmPassword');
      return;
    }
    if (!passwordsMatch) {
      setValidationError('PINs do not match.');
      setInvalidField('confirmPassword');
      return;
    }

    setValidationError('');
    setInvalidField(null);
    clearError();

    try {
      await completeSignup(firstName, lastName, email, password);
    } catch (err) {
      return; // backendError is already set in the store, stay on screen
    }
  };

  const displayedError = validationError || backendError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <KeyboardAvoidingView style={styles.keyboardFrame} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        <View style={styles.content}>
          <EcoSavesLogo variant="badge" />

          <Text style={styles.title}>Create Security PIN</Text>
          <Text style={styles.subtitle}>Set a 6-digit PIN to secure your account</Text>

          <View style={styles.form}>
            <InputField
              label="6-Digit Security PIN"
              placeholder="••••••"
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              value={password}
              onChangeText={handlePasswordChange}
              inputStyle={invalidField === 'password' ? styles.inputError : null}
            />

            {password.length > 0 && (
              <View style={styles.rulesBox}>
                {ruleResults.map((rule) => (
                  <View key={rule.key} style={styles.ruleRow}>
                    <View style={[styles.ruleDot, rule.passed && styles.ruleDotPassed]}>
                      {rule.passed ? <Text style={styles.ruleCheckmark}>✓</Text> : null}
                    </View>
                    <Text style={[styles.ruleLabel, rule.passed && styles.ruleLabelPassed]}>
                      {rule.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <InputField
              label="Re-enter Security PIN"
              placeholder="••••••"
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              inputStyle={invalidField === 'confirmPassword' ? styles.inputError : null}
            />

            {confirmPassword.length > 0 && !passwordsMatch ? (
              <Text style={styles.mismatchText}>PINs do not match</Text>
            ) : null}
          </View>

          {displayedError ? <Text style={styles.errorText}>{displayedError}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Button
            title="Complete Registration"
            loading={isLoading}
            disabled={!canSubmit}
            style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
            onPress={handleFinish}
          />
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
  rulesBox: {
    marginTop: -8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ruleDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C4C9CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  ruleDotPassed: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  ruleCheckmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  ruleLabel: {
    fontSize: 13,
    color: '#737980',
  },
  ruleLabelPassed: {
    color: '#2E7D32',
  },
  mismatchText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
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
  primaryButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});