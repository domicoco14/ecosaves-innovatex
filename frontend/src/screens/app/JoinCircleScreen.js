import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export const JoinCircleScreen = ({ route, navigation }) => {
  const [circleCode, setCircleCode] = useState(route.params?.inviteCode || '');
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setPendingInviteCode = useAuthStore((state) => state.setPendingInviteCode);
  const clearPendingInviteCode = useAuthStore((state) => state.clearPendingInviteCode);

  const handleJoin = async () => {
    const inviteInput = circleCode.trim();
    const urlMatch = inviteInput.match(/(?:https:\/\/ecosaves\.app\/join\/|ecosaves:\/\/join\/)([a-z0-9-]+)/i);
    const inviteCode = (urlMatch?.[1] || inviteInput).trim().toLowerCase();
    if (!inviteCode) {
      Alert.alert('Invitation code required', 'Enter the code shared by the circle creator.');
      return;
    }

    if (!isAuthenticated) {
      setPendingInviteCode(inviteCode);
      Alert.alert('Sign in to join', 'You need an EcoSaves account to join this circle.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => navigation.navigate('Login') },
        { text: 'Create account', onPress: () => navigation.navigate('Signup') },
      ]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/circles/join', { invite_code: inviteCode });
      clearPendingInviteCode();
      Alert.alert('You joined the circle', `${response.data.name} has been added to your groups.`, [
        {
          text: 'View circle',
          onPress: () => navigation.navigate('GroupDetail', { group: response.data }),
        },
      ]);
    } catch (err) {
      Alert.alert(
        'Could not join circle',
        err.response?.data?.detail || 'Check the invitation code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardFrame} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Text style={styles.title}>Join a circle</Text>
        <Text style={styles.subtitle}>Open a shared EcoSaves invite link or enter the invitation code from the circle creator.</Text>

        <Card style={styles.card}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {isAuthenticated
                ? 'Your account is required to join. Your payout position is assigned when you join.'
                : 'You can preview the invitation here. Sign in or create an account to join; we will keep this invitation for you.'}
            </Text>
          </View>
          <InputField
            label="INVITATION CODE"
            value={circleCode}
            onChangeText={setCircleCode}
            placeholder="Paste invitation link or code"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button title="Join circle" loading={loading} onPress={handleJoin} style={styles.button} />
        </Card>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F9F9',
  },
  keyboardFrame: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
  },
  title: {
    color: '#161C20',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#737980',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 22,
  },
  card: {
    borderRadius: 18,
    padding: 18,
  },
  infoBox: {
    backgroundColor: '#E6F3F7',
    borderColor: '#BAE6FD',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
    padding: 12,
  },
  infoText: {
    color: '#005B7F',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#005B7F',
    borderRadius: 16,
    height: 52,
  },
});