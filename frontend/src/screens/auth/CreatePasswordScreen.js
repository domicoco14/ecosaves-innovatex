import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

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

  const handlePasswordChange = (text) => {
    setPasswordState(text);
    if (validationError) {
      setValidationError('');
      setInvalidField(null);
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (validationError) {
      setValidationError('');
      setInvalidField(null);
    }
  };

  const handleFinish = async () => {
    if (!password.trim()) {
      setValidationError('Please enter a password.');
      setInvalidField('password');
      return;
    }
    if (password.trim().length < 8) {
      setValidationError('Password must be at least 8 characters.');
      setInvalidField('password');
      return;
    }
    if (!confirmPassword.trim()) {
      setValidationError('Please re-enter your password.');
      setInvalidField('confirmPassword');
      return;
    }
    if (password.trim() !== confirmPassword.trim()) {
      setValidationError('Passwords do not match.');
      setInvalidField('confirmPassword');
      return;
    }

    setValidationError('');
    setInvalidField(null);
    clearError();

    try {
      await completeSignup(firstName, lastName, email, password.trim());
    } catch (err) {
      return; // backendError is already set in the store, stay on screen
    }

    navigation.navigate('ConnectBlaze');
  };

  const displayedError = validationError || backendError;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <EcoSavesLogo variant="badge" />

          <Text style={styles.title}>Create Password</Text>
          <Text style={styles.subtitle}>Create your password</Text>

          <View style={styles.form}>
            <InputField
              label="Password"
              placeholder="XXXXXXXX"
              secureTextEntry
              value={password}
              onChangeText={handlePasswordChange}
              inputStyle={invalidField === 'password' ? styles.inputError : null}
            />

            <InputField
              label="Re-enter Password"
              placeholder="XXXXXXXX"
              secureTextEntry
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              inputStyle={invalidField === 'confirmPassword' ? styles.inputError : null}
            />
          </View>

          {displayedError ? <Text style={styles.errorText}>{displayedError}</Text> : null}
        </View>

        <View style={styles.footer}>
          <Button
            title="Get Started"
            loading={isLoading}
            style={styles.primaryButton}
            onPress={handleFinish}
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
