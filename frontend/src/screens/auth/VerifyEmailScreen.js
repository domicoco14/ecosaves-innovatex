import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';

export const VerifyEmailScreen = ({ route, navigation }) => {
  const email = route.params?.email || 'your email';
  const [code, setCode] = useState('');

  const handleVerify = () => {
    navigation.navigate('CreatePassword');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Email</Text>
      <Text style={styles.subtitle}>
        We sent a 6-digit verification code to <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <InputField
        label="Verification Code"
        placeholder="Enter 6-digit code"
        keyboardType="number-pad"
        value={code}
        onChangeText={setCode}
      />

      <Button title="Verify & Continue" onPress={handleVerify} style={styles.button} />
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
    lineHeight: 20,
  },
  emailHighlight: {
    color: '#00597C',
    fontWeight: '600',
  },
  button: {
    marginTop: 20,
  },
});
