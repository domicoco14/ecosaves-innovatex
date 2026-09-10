import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ProgressBar } from '../../components/ProgressBar';
import { StatusBadge } from '../../components/StatusBadge';
import { AvatarStack } from '../../components/AvatarStack';
import { BlazeAccountModal } from '../../components/BlazeAccountModal';
import { useAuthStore } from '../../store/authStore';
import { useCurrencyStore } from '../../store/currencyStore';
import { CurrencySelectorModal } from '../../components/CurrencySelectorModal';

export const HomeScreen = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const formatAmount = useCurrencyStore((state) => state.formatAmount);

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'Member';
  const isBlazeLinked = Boolean(user?.blaze_linked);
  const blazeAccountNumber = user?.blaze_account_number || '1441002006858';

  const mockMembers = [
    { initials: 'JD', color: '#005B7F' },
    { initials: 'AO', color: '#E98591' },
    { initials: 'FK', color: '#29875A' },
    { initials: 'CI', color: '#B78103' },
    { initials: 'MT', color: '#005B7F' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Pan-African Currency Selector Modal */}
      <CurrencySelectorModal visible={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} />

      {/* Gated Blaze Account Setup Modal if not linked */}
      <BlazeAccountModal visible={!isBlazeLinked} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* 1. User Header Greeting */}
        <View style={styles.headerRow}>
          <View style={styles.userProfileGroup}>
            <TouchableOpacity
              style={styles.avatarHeader}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.8}
            >
              {user?.profile_picture ? (
                <Image source={{ uri: user.profile_picture }} style={styles.avatarHeaderImg} />
              ) : (
                <Text style={styles.avatarHeaderText}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.nameBlock}>
              <Text style={styles.greetingSub}>Welcome back 👋</Text>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.greetingName}>{user?.first_name || 'Dominion'}</Text>
                <View style={styles.verifiedTag}>
                  <Text style={styles.verifiedTagText}>✓ Blaze</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Pan-African Currency Pill */}
          <TouchableOpacity
            style={styles.currencyPill}
            onPress={() => setShowCurrencyModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.currencyPillText}>
              {selectedCurrency.flag} {selectedCurrency.code} ▼
            </Text>
          </TouchableOpacity>
        </View>

        {/* 2. Quick Stats Pills Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statPill, styles.statPillBlue]}>
            <Text style={styles.statPillIcon}>👥</Text>
            <Text style={styles.statPillTextBlue}>0 Circles</Text>
          </View>

          <View style={[styles.statPill, styles.statPillGreen]}>
            <Text style={styles.statPillIcon}>💰</Text>
            <Text style={styles.statPillTextGreen}>{formatAmount(0)} saved</Text>
          </View>

          <View style={[styles.statPill, styles.statPillPink]}>
            <Text style={styles.statPillIcon}>⏱️</Text>
            <Text style={styles.statPillTextPink}>0 Payouts</Text>
          </View>
        </View>

        {/* 3. Hero Cycle Contribution Card */}
        <Card style={styles.heroCard}>
          <Text style={styles.heroSub}>Total contributed this cycle</Text>
          <Text style={styles.heroBalance}>{formatAmount(0)}</Text>

          <View style={styles.heroProgressBlock}>
            <ProgressBar progress={0} color="#38BDF8" height={8} />
            <Text style={styles.heroProgressText}>0% to cycle goal • {formatAmount(50000)}</Text>
          </View>

          <View style={styles.heroActionBtnRow}>
            <TouchableOpacity
              style={styles.heroActionBtnLight}
              onPress={() => navigation.navigate('Wallet')}
              activeOpacity={0.8}
            >
              <Text style={styles.heroActionBtnLightText}>+ Add Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroActionBtnBorder}
              onPress={() => navigation.navigate('ContributionHistory')}
              activeOpacity={0.8}
            >
              <Text style={styles.heroActionBtnBorderText}>📊 History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.autoDebitBanner}>
            <Text style={styles.autoDebitText}>⚡ Ecobank Blaze Auto-Debit: Ready</Text>
          </View>
        </Card>

        {/* 4. Your Groups Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Your Groups</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Groups')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* Group Item 1: Yaba Traders Ajo */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('GroupDetail', { group: { name: 'Yaba Traders Ajo', contribution: '₦5,000', totalPool: '₦60,000', membersCount: 12, cycle: 'Cycle 3 of 12' } })}
        >
          <Card style={styles.groupCard}>
            <View style={styles.groupHeaderRow}>
              <View style={styles.groupIconBox}>
                <Text style={styles.groupIconText}>🛍️</Text>
              </View>
              <View style={styles.groupTitleBlock}>
                <Text style={styles.groupName}>Yaba Traders Ajo</Text>
                <Text style={styles.groupSub}>12 members • ₦5,000/cycle</Text>
              </View>
              <View style={styles.turnBadgeCoral}>
                <Text style={styles.turnBadgeTextCoral}>Your turn #3</Text>
              </View>
            </View>

            <View style={styles.groupCardBottom}>
              <AvatarStack count={5} size={24} />
              <View style={styles.barBlock}>
                <ProgressBar progress={75} color="#E98591" height={6} />
                <Text style={styles.barText}>75% funded this cycle</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Group Item 2: Family Esusu Circle */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => navigation.navigate('GroupDetail', { group: { name: 'Family Esusu Circle', contribution: '₦10,000', totalPool: '₦60,000', membersCount: 6, cycle: 'Cycle 2 of 6' } })}
        >
          <Card style={styles.groupCard}>
            <View style={styles.groupHeaderRow}>
              <View style={[styles.groupIconBox, { backgroundColor: '#E6F5EB' }]}>
                <Text style={styles.groupIconText}>🏡</Text>
              </View>
              <View style={styles.groupTitleBlock}>
                <Text style={styles.groupName}>Family Esusu Circle</Text>
                <Text style={styles.groupSub}>6 members • ₦10,000/cycle</Text>
              </View>
              <StatusBadge label="Active" type="active" />
            </View>

            <View style={styles.groupCardBottom}>
              <AvatarStack count={4} size={24} />
              <View style={styles.barBlock}>
                <ProgressBar progress={40} color="#29875A" height={6} />
                <Text style={styles.barText}>40% funded this cycle</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Quick Action Button to Create Group */}
        <TouchableOpacity
          style={styles.createFloatingBtn}
          onPress={() => navigation.navigate('CreateGroupStack')}
        >
          <Text style={styles.createFloatingBtnText}>+ Start a New Ajo Circle</Text>
        </TouchableOpacity>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userProfileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#005B7F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarHeaderImg: {
    width: '100%',
    height: '100%',
  },
  avatarHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  currencyPill: {
    backgroundColor: '#E6F3F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#005B7F',
  },
  currencyPillText: {
    color: '#005B7F',
    fontSize: 12,
    fontWeight: '800',
  },
  nameBlock: {},
  greetingSub: {
    fontSize: 12,
    color: '#737980',
    fontWeight: '500',
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  greetingName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#161C20',
  },
  verifiedTag: {
    backgroundColor: '#E6F5EB',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  verifiedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#29875A',
  },
  bellIconBtn: {
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
  bellIconText: {
    fontSize: 16,
  },
  bellBadgeDot: {
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statPillBlue: {
    backgroundColor: '#E6F3F7',
  },
  statPillGreen: {
    backgroundColor: '#E6F5EB',
  },
  statPillPink: {
    backgroundColor: '#FFF0F2',
  },
  statPillIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  statPillTextBlue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#005B7F',
  },
  statPillTextGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#29875A',
  },
  statPillTextPink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E98591',
  },
  heroCard: {
    backgroundColor: '#005B7F',
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },
  heroSub: {
    fontSize: 13,
    color: '#BAE6FD',
    fontWeight: '600',
  },
  heroBalance: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  heroProgressBlock: {
    marginVertical: 8,
  },
  heroProgressText: {
    fontSize: 12,
    color: '#BAE6FD',
    marginTop: 6,
    fontWeight: '600',
  },
  heroActionBtnRow: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 4,
  },
  heroActionBtnLight: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  heroActionBtnLightText: {
    color: '#005B7F',
    fontWeight: '800',
    fontSize: 13,
  },
  heroActionBtnBorder: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  heroActionBtnBorderText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  autoDebitBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  autoDebitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#161C20',
  },
  seeAllText: {
    fontSize: 13,
    color: '#005B7F',
    fontWeight: '700',
  },
  groupCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  groupIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  groupIconText: {
    fontSize: 18,
  },
  groupTitleBlock: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#161C20',
  },
  groupSub: {
    fontSize: 12,
    color: '#737980',
    marginTop: 2,
  },
  turnBadgeCoral: {
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  turnBadgeTextCoral: {
    color: '#E98591',
    fontSize: 11,
    fontWeight: '800',
  },
  groupCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F3F5',
    paddingTop: 12,
  },
  barBlock: {
    flex: 1,
    marginLeft: 16,
  },
  barText: {
    fontSize: 11,
    color: '#737980',
    marginTop: 4,
    textAlign: 'right',
  },
  createFloatingBtn: {
    backgroundColor: '#005B7F',
    borderRadius: 16,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  createFloatingBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
