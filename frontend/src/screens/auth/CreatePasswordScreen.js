import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';
import { PINInput } from '../../components/PINInput';
import { Button } from '../../components/Button';
import { KeyboardAwareScrollView } from '../../components/KeyboardAwareScrollView';
import { KeyboardAwareView } from '../../components/KeyboardAwareView';
import { useAuthStore } from '../../store/authStore';

const PIN_RULES = [
  { key: 'length', label: 'Exactly 6 digits', test: (pin) => pin.length === 6 },
  { key: 'numeric', label: 'Numbers only', test: (pin) => /^[0-9]+$/.test(pin) },
];

export const CreatePasswordScreen = ({ route, navigation }) => {
  const email = route.params?.email || 'johndoe@gmail.com';
  const firstName = route.params?.firstName || '';
  const lastName = route.params?.lastName || '';
  const [pin, setPinState] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [validationError, setValidationError] = useState('');
  const [invalidField, setInvalidField] = useState(null); // 'pin' | 'confirmPin' | null

  const completeSignup = useAuthStore((state) => state.completeSignup);
  const isLoading = useAuthStore((state) => state.isLoading);
  const backendError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const ruleResults = useMemo(
    () => PIN_RULES.map((rule) => ({ ...rule, passed: rule.test(pin) })),
    [pin]
  );
  const allRulesPassed = ruleResults.every((rule) => rule.passed);
  const pinsMatch = confirmPin.length === 6 && pin === confirmPin;
  const canSubmit = allRulesPassed && pinsMatch;

  const handlePinChange = (text) => {
    setPinState(text);
    if (validationError) {
      setValidationError('');
      setInvalidField(null);
    }
  };

  const handleConfirmPinChange = (text) => {
    setConfirmPin(text);
    if (validationError) {
      setValidationError('');
      setInvalidField(null);
    }
  };

  const handleFinish = async () => {
    if (!allRulesPassed) {
      setValidationError('Please enter a valid 6-digit security PIN.');
      setInvalidField('pin');
      return;
    }
    if (confirmPin.length < 6) {
      setValidationError('Please complete re-entering your 6-digit PIN.');
      setInvalidField('confirmPin');
      return;
    }
    if (!pinsMatch) {
      setValidationError('PINs do not match.');
      setInvalidField('confirmPin');
      return;
    }

    setValidationError('');
    setInvalidField(null);
    clearError();

    try {
      await completeSignup(firstName, lastName, email, pin);
    } catch (err) {
      return; // backendError is already set in the store, stay on screen
    }
  };

  const displayedError = validationError || backendError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <KeyboardAwareView>
        <KeyboardAwareScrollView contentContainerStyle={styles.container}>
          <View style={styles.content}>
            <EcoSavesLogo variant="badge" />

            <Text style={styles.title}>Create Security PIN</Text>
            <Text style={styles.subtitle}>Set a 6-digit passcode PIN to secure your account</Text>

            <View style={styles.form}>
              <Text style={styles.fieldLabel}>New 6-Digit PIN</Text>
              <PINInput
                value={pin}
                onChange={handlePinChange}
                length={6}
                error={invalidField === 'pin'}
                autoFocus={true}
              />

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Confirm 6-Digit PIN</Text>
              <PINInput
                value={confirmPin}
                onChange={handleConfirmPinChange}
                length={6}
                error={invalidField === 'confirmPin'}
                autoFocus={false}
              />

              {confirmPin.length === 6 && !pinsMatch ? (
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
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 140,
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
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