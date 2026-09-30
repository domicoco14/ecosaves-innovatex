import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

const extractInviteSlug = (value) => {
  const input = value.trim();
  const match = input.match(/(?:https?:\/\/)?(?:www\.)?ecosaves\.app\/join\/([a-z0-9-]+)|ecosaves:\/\/join\/([a-z0-9-]+)/i);
  const raw = (match?.[1] || match?.[2] || input).split(/[?#]/)[0].trim().toLowerCase();
  return raw.replace(/\/+$/, '');
};

export const JoinCircleScreen = ({ route, navigation }) => {
  const [circleCode, setCircleCode] = useState(route.params?.inviteCode || '');
  const [invitePreview, setInvitePreview] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setPendingInviteCode = useAuthStore((state) => state.setPendingInviteCode);
  const clearPendingInviteCode = useAuthStore((state) => state.clearPendingInviteCode);

  useEffect(() => {
    const inviteSlug = route.params?.inviteCode;
    if (inviteSlug) {
      const normalized = extractInviteSlug(inviteSlug);
      setCircleCode(normalized);
      loadInvitePreview(normalized);
    }
  }, [route.params?.inviteCode]);

  const loadInvitePreview = async (rawCode = circleCode) => {
    const inviteSlug = extractInviteSlug(rawCode);
    if (!(/^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{32}$/.test(inviteSlug) || /^[0-9a-f]{32}$/.test(inviteSlug))) {
      setPreviewError('Enter a valid EcoSaves invitation link or code.');
      return;
    }
    setLoading(true);
    setPreviewError('');
    try {
      const response = await api.get(`/circles/invites/${encodeURIComponent(inviteSlug)}`);
      setInvitePreview({ ...response.data, invite_slug: inviteSlug });
    } catch (err) {
      setInvitePreview(null);
      setPreviewError(err.response?.data?.detail || 'Invitation not found or no longer available.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    const inviteCode = invitePreview?.invite_slug || extractInviteSlug(circleCode);
    if (!inviteCode) {
      Alert.alert('Invitation code required', 'Enter the code shared by the circle creator.');
      return;
    }

    if (!isAuthenticated) {
      setPendingInviteCode(inviteCode);
      navigation.setParams({ inviteCode });
      Alert.alert('Sign in to join', 'You need an EcoSaves account to join this circle.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => navigation.navigate('Login') },
        { text: 'Create account', onPress: () => navigation.navigate('Signup') },
      ]);
      return;
    }

    if (!invitePreview) {
      await loadInvitePreview(circleCode);
      return;
    }

    if (invitePreview.status !== 'forming' || invitePreview.members_count >= invitePreview.member_limit) {
      Alert.alert('Circle unavailable', 'This circle is already full or is no longer accepting members.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/circles/join', { invite_code: inviteCode });
      clearPendingInviteCode();
      setCircleCode('');
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
      <KeyboardAvoidingView style={styles.keyboardFrame} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
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
            onChangeText={(value) => {
              setCircleCode(value);
              setInvitePreview(null);
              setPreviewError('');
            }}
            placeholder="Paste invitation link or code"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {!invitePreview ? (
            <Button title="Review invitation" loading={loading} onPress={() => loadInvitePreview()} style={styles.button} />
          ) : (
            <View style={styles.preview}>
              <Text style={styles.previewEyebrow}>CIRCLE INVITATION</Text>
              <Text style={styles.previewTitle}>{invitePreview.name}</Text>
              <Text style={styles.previewText}>
                ₦{Number(invitePreview.contribution_amount).toLocaleString()} / {invitePreview.frequency.replace('-', ' ')}
              </Text>
              <Text style={styles.previewText}>
                {invitePreview.members_count} of {invitePreview.member_limit} member slots filled
              </Text>
              <Button
                title={isAuthenticated ? 'Join circle' : 'Sign in to join'}
                loading={loading}
                onPress={handleJoin}
                style={styles.button}
              />
            </View>
          )}
          {previewError ? <Text style={styles.errorText}>{previewError}</Text> : null}
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
  preview: {
    backgroundColor: '#F6F9F9',
    borderColor: '#E5ECEF',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
    padding: 14,
  },
  previewEyebrow: { color: '#737980', fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  previewTitle: { color: '#161C20', fontSize: 17, fontWeight: '800', marginTop: 5 },
  previewText: { color: '#737980', fontSize: 12, marginTop: 5, textTransform: 'capitalize' },
  errorText: { color: '#B42318', fontSize: 12, lineHeight: 17, marginTop: 12 },
});