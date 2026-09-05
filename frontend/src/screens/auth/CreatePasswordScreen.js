import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

export const CreatePasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleFinish = () => {
    // Authenticate user into app
    login({ name: 'EcoSaves User', email: 'user@ecosaves.app' }, 'mock-jwt-token-12345');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Password</Text>
      <Text style={styles.subtitle}>Set a secure password for your EcoSaves account</Text>

      <InputField
        label="Password"
        placeholder="Enter password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <InputField
        label="Confirm Password"
        placeholder="Re-enter password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button title="Complete Registration" onPress={handleFinish} style={styles.button} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F9',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#737980',
    marginBottom: 24,
  },
  button: {
    marginTop: 20,
  },
});
