import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { CurrencySelectorModal } from '../../components/CurrencySelectorModal';

export const ProfileScreen = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);

  const firstName = user?.first_name || 'Dominion';
  const lastName = user?.last_name || 'Akinsola';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = user?.email || 'dominion@ecosaves.ng';
  const blazeAccountNo = user?.blaze_account_number || '1441002006858';

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  ];

  const handleSelectAvatar = (url) => {
    updateUser({ profile_picture: url });
    setShowAvatarModal(false);
    Alert.alert('Profile Picture Updated ✨', 'Your profile picture has been saved successfully.');
  };

  const handleSaveCustomAvatar = () => {
    if (!customAvatarUrl.trim()) {
      Alert.alert('Invalid Link', 'Please enter a valid image web URL.');
      return;
    }
    updateUser({ profile_picture: customAvatarUrl.trim() });
    setShowAvatarModal(false);
    setCustomAvatarUrl('');
    Alert.alert('Profile Picture Updated ✨', 'Your profile picture has been saved successfully.');
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      Alert.alert('Sign Out Error', 'Unable to sign out safely. Please try again.');
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const accountSettings = [
    {
      id: '1',
      title: 'Personal Information',
      sub: 'Update your profile picture, data & KYC',
      icon: '👤',
      action: () => setShowPersonalInfoModal(true),
    },
    {
      id: '2',
      title: 'Security & PIN',
      sub: 'Password, transaction PIN & limits',
      icon: '🔒',
      action: () => setShowSecurityModal(true),
    },
    {
      id: '3',
      title: 'Linked Ecobank Blaze Account',
      sub: `Account No: ${blazeAccountNo}`,
      icon: '🏦',
      action: () => navigation.navigate('ConnectBlaze'),
    },
  ];

  const moreItems = [
    {
      id: '4',
      title: 'Help & Support',
      sub: 'FAQs, Live chat & Contact Us',
      icon: '🎧',
      action: () => setShowHelpModal(true),
    },
    {
      id: '5',
      title: 'Terms & Privacy Policy',
      sub: 'Security guidelines & Legal information',
      icon: '📜',
      action: () => Alert.alert('EcoSaves Legal', 'EcoSaves operates in partnership with Ecobank Blaze under strict CBN guidelines.'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <CurrencySelectorModal visible={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Sleek Top Header Row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>My Profile</Text>
            <Text style={styles.pageSubtitle}>Manage your account & settings</Text>
          </View>
          
          {/* Pan-African Currency Switcher Pill */}
          <TouchableOpacity
            style={styles.currencyPillHeader}
            onPress={() => setShowCurrencyModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.currencyPillText}>
              {selectedCurrency.flag} {selectedCurrency.code} ({selectedCurrency.symbol}) ▼
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Profile Hero Card */}
        <Card style={styles.profileHeroCard}>
          <TouchableOpacity
            style={styles.avatarBorder}
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.85}
          >
            {user?.profile_picture ? (
              <Image source={{ uri: user.profile_picture }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarInner}>
                <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userEmail}>{email}</Text>

          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>● Active Savings Member</Text>
          </View>

          {/* Trust Score & Streak Banner */}
          <View style={styles.trustScoreCard}>
            <View style={styles.trustScoreLeft}>
              <Text style={styles.trustLabel}>TRUST SCORE</Text>
              <Text style={styles.trustValue}>100/100</Text>
            </View>
            <View style={styles.streakPill}>
              <Text style={styles.streakPillText}>🌱 0 Months Streak</Text>
            </View>
          </View>
        </Card>

        {/* ACCOUNT SETTINGS SECTION */}
        <Text style={styles.sectionLabel}>ACCOUNT SETTINGS</Text>
        <Card style={styles.menuCard}>
          {accountSettings.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                index < accountSettings.length - 1 && styles.menuBorder,
              ]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBox}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View style={styles.menuTitleBlock}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* MORE SECTION */}
        <Text style={styles.sectionLabel}>SUPPORT & LEGAL</Text>
        <Card style={styles.menuCard}>
          {moreItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuRow,
                index < moreItems.length - 1 && styles.menuBorder,
              ]}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconBox}>
                <Text style={styles.menuIconText}>{item.icon}</Text>
              </View>
              <View style={styles.menuTitleBlock}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 1. SIGN OUT CONFIRMATION MODAL */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.logoutIconCircle}>
              <Text style={styles.logoutIconCircleText}>🚪</Text>
            </View>
            <Text style={styles.modalTitleCenter}>Sign Out of EcoSaves?</Text>
            <Text style={styles.modalSubCenter}>
              Are you sure you want to sign out? Your session tokens will be safely cleared and you will be returned to the login screen.
            </Text>

            <View style={styles.securityBox}>
              <Text style={styles.securityBoxText}>
                🔒 256-Bit SSL Encrypted Session • Ecobank Blaze Protected
              </Text>
            </View>

            <Button
              title="Yes, Sign Out"
              variant="accent"
              loading={loggingOut}
              onPress={handleConfirmLogout}
              style={{ marginTop: 14 }}
            />

            <TouchableOpacity
              style={styles.cancelModalBtn}
              onPress={() => setShowLogoutModal(false)}
            >
              <Text style={styles.cancelModalBtnText}>Cancel & Stay Signed In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 2. PERSONAL INFO MODAL */}
      <Modal visible={showPersonalInfoModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>Personal Details & KYC</Text>
            <Text style={styles.modalSub}>Verified identity profile synced with Supabase & Ecobank.</Text>

            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoVal}>{fullName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoVal}>{email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>KYC Status</Text>
                <Text style={styles.infoValGreen}>✓ Level 2 Verified</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoVal}>August 2026</Text>
              </View>
            </View>

            <Button
              title="Done"
              onPress={() => setShowPersonalInfoModal(false)}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      {/* 3. SECURITY & PIN MODAL */}
      <Modal visible={showSecurityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>Security & Credentials</Text>
            <Text style={styles.modalSub}>Manage your app authentication and PIN settings.</Text>

            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Biometric Unlock</Text>
                <Text style={styles.infoValGreen}>● Enabled (FaceID/Fingerprint)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction PIN</Text>
                <Text style={styles.infoVal}>•••• (Set)</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Auto-Lock Delay</Text>
                <Text style={styles.infoVal}>Immediate</Text>
              </View>
            </View>

            <Button
              title="Close"
              onPress={() => setShowSecurityModal(false)}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      {/* 4. HELP MODAL */}
      <Modal visible={showHelpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>Help & Support</Text>
            <Text style={styles.modalSub}>Need assistance with your Ajo circle or Ecobank Blaze wallet?</Text>

            <View style={styles.infoList}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Support Email</Text>
                <Text style={styles.infoValTeal}>support@ecosaves.ng</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Response Time</Text>
                <Text style={styles.infoVal}>Under 15 minutes</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ecobank Hotline</Text>
                <Text style={styles.infoVal}>+234 700 ECOBANK</Text>
              </View>
            </View>

            <Button
              title="Close Support"
              onPress={() => setShowHelpModal(false)}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      {/* PROFILE PICTURE SELECTION MODAL SHEET */}
      <Modal visible={showAvatarModal} transparent animationType="slide" onRequestClose={() => setShowAvatarModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>Update Profile Picture</Text>
            <Text style={styles.modalSub}>Select an avatar photo or enter an image web URL.</Text>

            <Text style={styles.presetLabel}>CHOOSE FROM PRESETS</Text>
            <View style={styles.presetGrid}>
              {avatarPresets.map((url, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.presetCircle}
                  onPress={() => handleSelectAvatar(url)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: url }} style={styles.presetImg} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.presetLabel}>OR ENTER IMAGE URL</Text>
            <TextInput
              style={styles.urlInput}
              placeholder="https://example.com/my-photo.jpg"
              placeholderTextColor="#9EA5AD"
              value={customAvatarUrl}
              onChangeText={setCustomAvatarUrl}
              autoCapitalize="none"
            />

            <Button
              title="Save Image URL"
              variant="accent"
              onPress={handleSaveCustomAvatar}
              style={{ marginTop: 12 }}
            />

            <TouchableOpacity style={styles.cancelModalBtn} onPress={() => setShowAvatarModal(false)}>
              <Text style={styles.cancelModalBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F9F9',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#161C20',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#737980',
    marginTop: 2,
    fontWeight: '500',
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#161C20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  bellText: {
    fontSize: 16,
  },
  bellDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E98591',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileHeroCard: {
    alignItems: 'center',
    borderRadius: 22,
    padding: 22,
    marginBottom: 20,
  },
  avatarBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#005B7F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#005B7F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161C20',
  },
  userEmail: {
    fontSize: 13,
    color: '#737980',
    marginTop: 2,
    marginBottom: 8,
  },
  activeBadge: {
    backgroundColor: '#E6F5EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 16,
  },
  activeBadgeText: {
    color: '#29875A',
    fontSize: 11,
    fontWeight: '700',
  },
  trustScoreCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAF9',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EAEFF2',
  },
  trustScoreLeft: {},
  trustLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#737980',
    letterSpacing: 0.5,
  },
  trustValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#005B7F',
    marginTop: 2,
  },
  streakPill: {
    backgroundColor: '#E6F5EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakPillText: {
    color: '#29875A',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#737980',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  menuCard: {
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F5',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconText: {
    fontSize: 16,
  },
  menuTitleBlock: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#161C20',
  },
  menuSub: {
    fontSize: 11,
    color: '#737980',
    marginTop: 1,
  },
  chevron: {
    fontSize: 18,
    color: '#737980',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFF0F2',
    borderRadius: 14,
    marginTop: 8,
  },
  signOutText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 20, 30, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  logoutIconCircleText: {
    fontSize: 26,
  },
  modalTitleCenter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#161C20',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubCenter: {
    fontSize: 13,
    color: '#737980',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  securityBox: {
    backgroundColor: '#F6F9F9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  securityBoxText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005B7F',
  },
  cancelModalBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  cancelModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#737980',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#161C20',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#737980',
    marginTop: 2,
  },
  currencyPillHeader: {
    backgroundColor: '#E6F3F7',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#005B7F',
  },
  currencyPillText: {
    color: '#005B7F',
    fontSize: 12,
    fontWeight: '800',
  },
  profileHeroCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  avatarBorder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#005B7F',
    padding: 3,
    marginBottom: 12,
    position: 'relative',
  },
  avatarInner: {
    flex: 1,
    borderRadius: 38,
    backgroundColor: '#005B7F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFCC00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cameraBadgeText: {
    fontSize: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#161C20',
  },
  userEmail: {
    fontSize: 13,
    color: '#737980',
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: '#E6F5EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  activeBadgeText: {
    color: '#29875A',
    fontSize: 11,
    fontWeight: '700',
  },
  trustScoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: '#F4F6F8',
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  trustScoreLeft: {},
  trustLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#737980',
    letterSpacing: 0.5,
  },
  trustValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#005B7F',
    marginTop: 2,
  },
  streakPill: {
    backgroundColor: '#E6F5EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakPillText: {
    color: '#29875A',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#737980',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  menuCard: {
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F5',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F0F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconText: {
    fontSize: 16,
  },
  menuTitleBlock: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#161C20',
  },
  menuSub: {
    fontSize: 11,
    color: '#737980',
    marginTop: 1,
  },
  chevron: {
    fontSize: 18,
    color: '#737980',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFF0F2',
    borderRadius: 14,
    marginTop: 8,
  },
  signOutText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 20, 30, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
  },
  logoutIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  logoutIconCircleText: {
    fontSize: 26,
  },
  modalTitleCenter: {
    fontSize: 20,
    fontWeight: '800',
    color: '#161C20',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubCenter: {
    fontSize: 13,
    color: '#737980',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  securityBox: {
    backgroundColor: '#F6F9F9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  securityBoxText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005B7F',
  },
  cancelModalBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  cancelModalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#737980',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    color: '#737980',
    marginBottom: 16,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#737980',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  presetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  presetCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#005B7F',
  },
  presetImg: {
    width: '100%',
    height: '100%',
  },
  urlInput: {
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#161C20',
    borderWidth: 1,
    borderColor: '#E5E8EB',
    marginBottom: 12,
  },
  infoList: {
    backgroundColor: '#F6F9F9',
    borderRadius: 14,
    padding: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  infoLabel: {
    fontSize: 12,
    color: '#737980',
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#161C20',
  },
  infoValGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: '#29875A',
  },
  infoValTeal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#005B7F',
  },
});
