import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { ProgressBar } from '../../components/ProgressBar';
import { AvatarStack } from '../../components/AvatarStack';
import { useCurrencyStore } from '../../store/currencyStore';
import { CurrencySelectorModal } from '../../components/CurrencySelectorModal';

export const GroupsScreen = ({ navigation }) => {
  const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
  const formatAmount = useCurrencyStore((state) => state.formatAmount);

  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const activeGroups = [
    {
      id: 'g1',
      name: 'Yaba Traders Ajo',
      contribution: `${formatAmount(5000)}/cycle`,
      membersCount: 12,
      progress: 0,
      badge: 'Your turn #3',
      badgeType: 'coral',
      icon: '🛍️',
    },
    {
      id: 'g2',
      name: 'Family Esusu Circle',
      contribution: `${formatAmount(5000)}/cycle`,
      membersCount: 12,
      progress: 10,
      badge: 'Active',
      badgeType: 'active',
      icon: '🏡',
    },
    {
      id: 'g3',
      name: 'Lagos Tech Savings',
      contribution: `${formatAmount(10000)}/cycle`,
      membersCount: 8,
      progress: 50,
      badge: 'Your turn #2',
      badgeType: 'coral',
      icon: '💻',
    },
  ];

  const completedGroups = [
    {
      id: 'g4',
      name: 'Pan-African Traders Circle',
      contribution: `${formatAmount(5000)}/cycle`,
      membersCount: 12,
      progress: 100,
      badge: 'Completed',
      badgeType: 'completed',
      icon: '🛍️',
    },
    {
      id: 'g5',
      name: "Tech Bro's Ajo",
      contribution: `${formatAmount(15000)}/cycle`,
      membersCount: 6,
      progress: 100,
      badge: 'Completed',
      badgeType: 'completed',
      icon: '💻',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <CurrencySelectorModal visible={showCurrencyModal} onClose={() => setShowCurrencyModal(false)} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Sleek Top Header Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Your Groups</Text>
            <Text style={styles.pageSubtitle}>3 Active Circles • 2 Completed</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.currencyPillHeader}
              onPress={() => setShowCurrencyModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.currencyPillText}>
                {selectedCurrency.flag} {selectedCurrency.code} ▼
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.newGroupHeaderBtn}
              onPress={() => navigation.navigate('CreateGroupStack')}
              activeOpacity={0.8}
            >
              <Text style={styles.newGroupHeaderBtnText}>+ Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ACTIVE SECTION */}
        <Text style={styles.sectionLabel}>ACTIVE</Text>

        {activeGroups.map((group) => (
          <TouchableOpacity
            key={group.id}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('GroupDetail', { group })}
          >
            <Card style={styles.groupCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconText}>{group.icon}</Text>
                </View>
                <View style={styles.titleBlock}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupSub}>{group.membersCount} members • {group.contribution}</Text>
                </View>
                {group.badgeType === 'coral' ? (
                  <View style={styles.badgeCoral}>
                    <Text style={styles.badgeCoralText}>{group.badge}</Text>
                  </View>
                ) : (
                  <StatusBadge label={group.badge} type="active" />
                )}
              </View>

              <View style={styles.cardFooter}>
                <AvatarStack count={4} size={22} />
                <View style={styles.barBlock}>
                  <ProgressBar progress={group.progress} color={group.progress > 0 ? '#E98591' : '#E0E6E8'} height={6} />
                  <Text style={styles.barText}>{group.progress}% funded this cycle</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {/* COMPLETED SECTION */}
        <Text style={styles.sectionLabel}>COMPLETED</Text>

        {completedGroups.map((group) => (
          <TouchableOpacity
            key={group.id}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('GroupDetail', { group })}
          >
            <Card style={[styles.groupCard, styles.completedCard]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: '#F0F3F5' }]}>
                  <Text style={styles.iconText}>{group.icon}</Text>
                </View>
                <View style={styles.titleBlock}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupSub}>{group.membersCount} members • {group.contribution}</Text>
                </View>
                <View style={styles.badgeCompleted}>
                  <Text style={styles.badgeCompletedText}>{group.badge}</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <AvatarStack count={4} size={22} />
                <View style={styles.barBlock}>
                  <ProgressBar progress={100} color="#29875A" height={6} />
                  <Text style={styles.barText}>100% funded this cycle</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Join or Create Group Button */}
        <Button
          title="+ Join or Create a Group"
          onPress={() => navigation.navigate('CreateGroupStack')}
          style={styles.joinBtn}
        />
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
    paddingBottom: 40,
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
  currencyPillHeader: {
    backgroundColor: '#E6F3F7',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#005B7F',
    marginRight: 8,
  },
  currencyPillText: {
    color: '#005B7F',
    fontSize: 12,
    fontWeight: '800',
  },
  newGroupHeaderBtn: {
    backgroundColor: '#005B7F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  newGroupHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#737980',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 10,
  },
  groupCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  completedCard: {
    backgroundColor: '#FAFCFC',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  titleBlock: {
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
  badgeCoral: {
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeCoralText: {
    color: '#E98591',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeCompleted: {
    backgroundColor: '#E6F5EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeCompletedText: {
    color: '#29875A',
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
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
  joinBtn: {
    marginTop: 16,
    backgroundColor: '#005B7F',
    borderRadius: 16,
    height: 52,
  },
});
