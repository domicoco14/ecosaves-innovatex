import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [loggingOut, setLoggingOut] = useState(false);
  const firstName = user?.first_name || 'Member';
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'EcoSaves member';

  const confirmLogout = () => {
    Alert.alert('Sign out?', 'You can sign in again with your email and 6-digit PIN.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
          } catch {
            Alert.alert('Could not sign out', 'Please try again.');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My profile</Text>
        <Text style={styles.subtitle}>Your EcoSaves account information</Text>

        <Card style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text></View>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{user?.email || 'Email unavailable'}</Text>
          <View style={[styles.statusPill, user?.email_verified ? styles.verified : styles.unverified]}>
            <Text style={[styles.statusText, user?.email_verified ? styles.verifiedText : styles.unverifiedText]}>
              {user?.email_verified ? 'Email verified' : 'Email verification status unavailable'}
            </Text>
          </View>
        </Card>

        <Text style={styles.sectionLabel}>INTEGRATION STATUS</Text>
        <Card style={styles.integrationCard}>
          <Text style={styles.integrationTitle}>Ecobank Blaze</Text>
          <Text style={styles.integrationText}>
            Blaze linking, transfers, auto-debit, and fund locking are not available in this build. No linked account or bank balance is being shown.
          </Text>
        </Card>

        <Text style={styles.sectionLabel}>ABOUT YOUR SAVINGS DATA</Text>
        <Card style={styles.integrationCard}>
          <Text style={styles.integrationText}>
            Personal savings entries are self-reported tracking records. They are not confirmed bank deposits, and circle payout dates are schedule estimates until payment services are integrated.
          </Text>
        </Card>

        <Button title="Sign out" loading={loggingOut} onPress={confirmLogout} style={styles.logoutButton} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F9F9' },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 36 },
  title: { color: '#161C20', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#737980', fontSize: 13, marginTop: 4, marginBottom: 20 },
  profileCard: { alignItems: 'center', marginBottom: 24, padding: 24 },
  avatar: { alignItems: 'center', backgroundColor: '#005B7F', borderRadius: 42, height: 84, justifyContent: 'center', marginBottom: 14, width: 84 },
  avatarText: { color: '#FFFFFF', fontSize: 34, fontWeight: '800' },
  name: { color: '#161C20', fontSize: 20, fontWeight: '800' },
  email: { color: '#737980', fontSize: 13, marginTop: 5 },
  statusPill: { borderRadius: 999, marginTop: 12, paddingHorizontal: 12, paddingVertical: 6 },
  verified: { backgroundColor: '#E6F5EB' },
  unverified: { backgroundColor: '#FFF8E6' },
  statusText: { fontSize: 11, fontWeight: '700' },
  verifiedText: { color: '#29875A' },
  unverifiedText: { color: '#8A6500' },
  sectionLabel: { color: '#737980', fontSize: 11, fontWeight: '800', letterSpacing: 0.7, marginBottom: 9 },
  integrationCard: { marginBottom: 20, padding: 17 },
  integrationTitle: { color: '#161C20', fontSize: 14, fontWeight: '800', marginBottom: 6 },
  integrationText: { color: '#737980', fontSize: 12, lineHeight: 18 },
  logoutButton: { backgroundColor: '#005B7F', borderRadius: 16, height: 52, marginTop: 8 },
});