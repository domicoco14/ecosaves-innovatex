import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { InputField } from '../../components/InputField';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EcoSavesLogo } from '../../components/EcoSavesLogo';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

export const ConnectBlazeScreen = ({ navigation }) => {
  const [accountNumber, setAccountNumber] = useState('');
  const [verifiedName, setVerifiedName] = useState('');
  const [loading, setLoading] = useState(false);

  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const goToMainApp = () => {
    try {
      if (navigation.canGoBack()) {
        navigation.popToTop();
      } else {
        navigation.navigate('MainTabs');
      }
    } catch (e) {
      // Stack switch handles navigation
    }
  };

  const handleLinkLater = () => {
    updateUser({ blaze_linked: false });
    goToMainApp();
  };

  const handleVerifyAndConnect = async () => {
    if (!accountNumber.trim() || accountNumber.trim().length < 10) {
      Alert.alert('Account Number Required', 'Please enter a valid 10-digit Ecobank Blaze account number.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/connect-blaze', {
        blaze_account_identifier: accountNumber.trim(),
      });

      const confirmedName = response.data?.account_name;
      setVerifiedName(confirmedName || '');

      updateUser({
        blaze_linked: true,
        blaze_account_number: response.data?.account_no || accountNumber.trim(),
      });

      Alert.alert(
        'Account Verified ✅',
        `Welcome ${confirmedName || ''}. Your Ecobank Blaze account is connected.`,
        [{ text: 'Go to Dashboard', onPress: goToMainApp }]
      );
    } catch (err) {
      const message = err.response?.data?.detail || 'We couldn\'t verify that account. Please check the number and try again.';
      Alert.alert('Verification Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color="#161C20" />
          </TouchableOpacity>

          <EcoSavesLogo variant="square" size={40} />

          <View style={styles.bankBadge}>
            <Text style={styles.bankBadgeText}>ECOBANK BLAZE</Text>
          </View>
        </View>

        <Text style={styles.title}>Connect Your Ecobank Blaze Account</Text>
        <Text style={styles.subtitle}>
          Link your existing Blaze account to enable automated ajo contributions and receive instant lump-sum payouts.
        </Text>

        <Card style={styles.formCard}>
          <InputField
            label="Ecobank Blaze Account Number"
            placeholder="e.g. 1441002006858"
            keyboardType="numeric"
            maxLength={10}
            value={accountNumber}
            onChangeText={(text) => {
              setAccountNumber(text);
              setVerifiedName('');
            }}
          />

          {verifiedName ? (
            <View style={styles.verifiedBox}>
              <Text style={styles.verifiedLabel}>Account Name Verified ✅</Text>
              <Text style={styles.verifiedName}>{verifiedName}</Text>
              <Text style={styles.verifiedBank}>Ecobank Blaze • Active</Text>
            </View>
          ) : null}

          <Button
            title="Verify & Link Account"
            loading={loading}
            onPress={handleVerifyAndConnect}
            style={styles.connectBtn}
          />
        </Card>

        <View style={styles.createPromptBox}>
          <Text style={styles.createPromptText}>
            Don't have an Ecobank Blaze account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateBlazeAccount')}>
            <Text style={styles.createLinkText}>Create Instant Blaze Account →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.skipBtn} onPress={handleLinkLater}>
          <Text style={styles.skipText}>Link Account Later</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F9F9' },
  container: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EFEFEF' },
  bankBadge: { backgroundColor: '#E6F3F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  bankBadgeText: { fontSize: 11, fontWeight: '800', color: '#005B7F', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: '800', color: '#161C20', marginBottom: 8, lineHeight: 30 },
  subtitle: { fontSize: 14, color: '#737980', lineHeight: 20, marginBottom: 24 },
  formCard: { padding: 20, borderRadius: 20, marginBottom: 20 },
  verifiedBox: { backgroundColor: '#E6F5EB', borderColor: '#A3E0B7', borderWidth: 1, borderRadius: 14, padding: 14, marginVertical: 12 },
  verifiedLabel: { fontSize: 12, fontWeight: '700', color: '#29875A' },
  verifiedName: { fontSize: 16, fontWeight: '800', color: '#161C20', marginVertical: 2 },
  verifiedBank: { fontSize: 11, color: '#737980' },
  connectBtn: { marginTop: 12 },
  createPromptBox: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#EFEFEF' },
  createPromptText: { fontSize: 13, color: '#737980', marginBottom: 6 },
  createLinkText: { fontSize: 14, fontWeight: '800', color: '#E98591' },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontSize: 13, fontWeight: '700', color: '#737980' },
});