import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { ProgressBar } from '../../components/ProgressBar';
import { AvatarStack } from '../../components/AvatarStack';
import { useAuthStore } from '../../store/authStore';

export const GroupDetailScreen = ({ route }) => {
  const { group } = route.params || {};
  const user = useAuthStore((state) => state.user);

  const groupTitle = group?.name || 'Lagos Traders Circle';
  const monthlyContribution = group?.contribution || '₦50,000';
  const totalPool = group?.totalPool || '₦500,000';
  const memberCount = group?.membersCount || 10;
  const cycleText = group?.cycle || 'Cycle 3 of 10';

  const [paying, setPaying] = useState(false);
  const [hasContributed, setHasContributed] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Rotation sequence mock data
  const rotationSchedule = [
    { id: '1', name: 'Funke Adebayo', turn: 1, date: 'Sep 1, 2026', status: 'paid', isUser: false },
    { id: '2', name: `${user?.first_name || 'Dominion'} ${user?.last_name || 'Akinsola'} (You)`, turn: 2, date: 'Oct 1, 2026', status: 'next', isUser: true },
    { id: '3', name: 'Amaka Okeke', turn: 3, date: 'Nov 1, 2026', status: 'upcoming', isUser: false },
    { id: '4', name: 'Babatunde Raji', turn: 4, date: 'Dec 1, 2026', status: 'upcoming', isUser: false },
    { id: '5', name: 'Chioma Eze', turn: 5, date: 'Jan 1, 2027', status: 'upcoming', isUser: false },
  ];

  const handleConfirmPay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setShowConfirmModal(false);
      setHasContributed(true);
      Alert.alert(
        'Contribution Successful! 🎉',
        `Your ${monthlyContribution} monthly contribution to ${groupTitle} has been processed via your Ecobank Blaze account.`
      );
    }, 1200);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* 1. Header Overview Card */}
      <Card style={styles.headerCard}>
        <View style={styles.topRow}>
          <StatusBadge label="Active Group" type="active" />
          <Text style={styles.cycleBadge}>{cycleText}</Text>
        </View>

        <Text style={styles.groupTitle}>{groupTitle}</Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Monthly Contribution</Text>
            <Text style={styles.metricVal}>{monthlyContribution}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Total Lump Sum</Text>
            <Text style={styles.metricValTeal}>{totalPool}</Text>
          </View>
        </View>

        <View style={styles.memberProgressRow}>
          <AvatarStack count={memberCount} size={32} />
          <Text style={styles.memberText}>{memberCount} Members enrolled</Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Cycle Contribution Progress</Text>
            <Text style={styles.progressPercent}>{hasContributed ? '9/10 Paid' : '8/10 Paid'}</Text>
          </View>
          <ProgressBar progress={hasContributed ? 0.9 : 0.8} color="#005B7F" height={10} />
        </View>
      </Card>

      {/* 2. User Payout Slot Spotlight Card */}
      <Card style={styles.spotlightCard}>
        <View style={styles.spotlightHeader}>
          <View style={styles.spotlightBadge}>
            <Text style={styles.spotlightBadgeText}>YOUR PAYOUT TURN 🌟</Text>
          </View>
          <Text style={styles.spotlightDate}>Oct 1, 2026</Text>
        </View>
        <Text style={styles.spotlightTitle}>You receive {totalPool}</Text>
        <Text style={styles.spotlightSub}>
          Payout will be credited automatically to your Ecobank Blaze account upon turn completion.
        </Text>
      </Card>

      {/* Message Group Button (Matched to Figma Screen 7) */}
      <Button
        title="💬 Message Group"
        onPress={() => navigation.navigate('GroupChat', { groupName: groupTitle })}
        style={styles.messageGroupBtn}
      />

      {/* 3. Payout Rotation Schedule */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Payout Rotation Schedule</Text>
        <Text style={styles.sectionSub}>5 Total Rounds</Text>
      </View>

      {rotationSchedule.map((item) => (
        <View
          key={item.id}
          style={[
            styles.scheduleRow,
            item.isUser && styles.scheduleRowUser,
          ]}
        >
          <View style={styles.turnBadge}>
            <Text style={[styles.turnNum, item.isUser && styles.turnNumUser]}>
              #{item.turn}
            </Text>
          </View>

          <View style={styles.memberDetails}>
            <Text style={[styles.memberName, item.isUser && styles.memberNameUser]}>
              {item.name}
            </Text>
            <Text style={styles.memberDate}>Expected: {item.date}</Text>
          </View>

          {item.status === 'paid' && (
            <View style={styles.statusPaid}>
              <Text style={styles.statusPaidText}>Paid ✅</Text>
            </View>
          )}

          {item.status === 'next' && (
            <View style={styles.statusNext}>
              <Text style={styles.statusNextText}>Your Turn</Text>
            </View>
          )}

          {item.status === 'upcoming' && (
            <View style={styles.statusUpcoming}>
              <Text style={styles.statusUpcomingText}>Upcoming</Text>
            </View>
          )}
        </View>
      ))}

      {/* 4. Action Button */}
      <View style={styles.actionContainer}>
        {hasContributed ? (
          <View style={styles.contributedBanner}>
            <Text style={styles.contributedText}>
              ✅ Contribution for this cycle completed!
            </Text>
          </View>
        ) : (
          <Button
            title={`Pay Monthly Contribution (${monthlyContribution})`}
            variant="accent"
            onPress={() => setShowConfirmModal(true)}
          />
        )}
      </View>

      {/* Confirm Contribution Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeader}>Confirm Contribution</Text>
            <Text style={styles.modalSub}>
              You are about to transfer <Text style={{ fontWeight: '800', color: '#005B7F' }}>{monthlyContribution}</Text> from your linked Ecobank Blaze account to <Text style={{ fontWeight: '800', color: '#161C20' }}>{groupTitle}</Text>.
            </Text>

            <View style={styles.modalDetailsCard}>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Payment Method</Text>
                <Text style={styles.modalVal}>Ecobank Blaze (144***6858)</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Beneficiary Circle</Text>
                <Text style={styles.modalVal}>{groupTitle}</Text>
              </View>
              <View style={styles.modalRow}>
                <Text style={styles.modalLabel}>Amount</Text>
                <Text style={styles.modalValTeal}>{monthlyContribution}</Text>
              </View>
            </View>

            <Button
              title="Confirm Payment"
              variant="accent"
              loading={paying}
              onPress={handleConfirmPay}
              style={{ marginTop: 16 }}
            />

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowConfirmModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F6F9F9',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerCard: {
    marginBottom: 16,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cycleBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#005B7F',
    backgroundColor: '#E6F3F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  groupTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAF9',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E0E6E8',
    marginHorizontal: 12,
  },
  metricLabel: {
    fontSize: 11,
    color: '#737980',
    fontWeight: '600',
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#161C20',
  },
  metricValTeal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#005B7F',
  },
  memberProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#737980',
    marginLeft: 12,
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#737980',
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#005B7F',
  },
  spotlightCard: {
    backgroundColor: '#FFF8F9',
    borderColor: '#FCD7DC',
    borderWidth: 1,
    marginBottom: 20,
    padding: 18,
  },
  spotlightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  spotlightBadge: {
    backgroundColor: '#E98591',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  spotlightBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  spotlightDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E98591',
  },
  spotlightTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 4,
  },
  spotlightSub: {
    fontSize: 12,
    color: '#737980',
    lineHeight: 16,
  },
  messageGroupBtn: {
    backgroundColor: '#005B7F',
    borderRadius: 16,
    height: 50,
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#161C20',
  },
  sectionSub: {
    fontSize: 12,
    color: '#737980',
    fontWeight: '600',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  scheduleRowUser: {
    borderColor: '#E98591',
    backgroundColor: '#FFFDFD',
    borderWidth: 1.5,
  },
  turnBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  turnNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#737980',
  },
  turnNumUser: {
    color: '#E98591',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#161C20',
  },
  memberNameUser: {
    color: '#005B7F',
  },
  memberDate: {
    fontSize: 11,
    color: '#737980',
    marginTop: 2,
  },
  statusPaid: {
    backgroundColor: '#E6F5EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPaidText: {
    color: '#29875A',
    fontSize: 11,
    fontWeight: '700',
  },
  statusNext: {
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusNextText: {
    color: '#E98591',
    fontSize: 11,
    fontWeight: '800',
  },
  statusUpcoming: {
    backgroundColor: '#F0F3F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusUpcomingText: {
    color: '#737980',
    fontSize: 11,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 14,
  },
  contributedBanner: {
    backgroundColor: '#E6F5EB',
    borderColor: '#A3E0B7',
    borderWidth: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  contributedText: {
    color: '#29875A',
    fontWeight: '800',
    fontSize: 14,
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
  modalHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13,
    color: '#737980',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalDetailsCard: {
    backgroundColor: '#F6F9F9',
    borderRadius: 14,
    padding: 16,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 12,
    color: '#737980',
    fontWeight: '600',
  },
  modalVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#161C20',
  },
  modalValTeal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#005B7F',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#737980',
    fontWeight: '700',
    fontSize: 14,
  },
});

