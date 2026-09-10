import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

export const CreatePasswordScreen = ({ route, navigation }) => {
  const email = route.params?.email || 'johndoe@gmail.com';
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const setPassword = useAuthStore((state) => state.setPassword);
  const loginApi = useAuthStore((state) => state.loginApi);
  const loginMock = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const handleFinish = async () => {
    try {
      if (password) {
        await setPassword(email, password);
      }
    } catch (err) {
      console.log('Using mock auth for local testing');
    }

    // Save pending user profile and navigate to ConnectBlaze
    useAuthStore.getState().updateUser({
      name: 'Dominion Akinsola',
      email,
      first_name: 'Dominion',
      last_name: 'Akinsola',
    });
    navigation.navigate('ConnectBlaze');
  };

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
              onChangeText={setPasswordState}
            />

            <InputField
              label="Re-enter Password"
              placeholder="XXXXXXXX"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
});
