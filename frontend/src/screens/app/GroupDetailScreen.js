import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

const formatAmount = (amount) => `₦${Number(amount || 0).toLocaleString()}`;
const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
  year: 'numeric', month: 'short', day: 'numeric',
});

export const GroupDetailScreen = ({ route }) => {
  const [circle, setCircle] = useState(route.params?.group || null);
  const [loadError, setLoadError] = useState('');
  const user = useAuthStore((state) => state.user);
  const circleId = route.params?.group?.id;

  useEffect(() => {
    if (!circleId) return;
    api.get(`/circles/${circleId}`)
      .then((response) => setCircle(response.data))
      .catch((err) => setLoadError(err.response?.data?.detail || 'Could not refresh circle details.'));
  }, [circleId]);

  const memberCount = circle?.members_count ?? 0;
  const memberLimit = circle?.member_limit ?? 0;
  const members = circle?.members || [];
  const myMember = members.find((member) => member.user_id === user?.id);
  const frequency = circle?.frequency?.replace('-', ' ') || 'cycle';
  const contribution = formatAmount(circle?.contribution_amount);
  const totalPool = formatAmount(Number(circle?.contribution_amount || 0) * memberLimit);
  const isActive = circle?.status === 'active';

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.headerCard}>
        <View style={styles.topRow}>
          <StatusBadge label={isActive ? 'Active' : 'Forming'} type={isActive ? 'active' : 'pending'} />
          <Text style={styles.cycleBadge}>{memberCount}/{memberLimit} members</Text>
        </View>
        <Text style={styles.groupTitle}>{circle?.name || 'Savings Circle'}</Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Contribution</Text>
            <Text style={styles.metricVal}>{contribution} / {frequency}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Full circle pool</Text>
            <Text style={styles.metricValTeal}>{totalPool}</Text>
          </View>
        </View>

        <View style={styles.progressHeader}>
          <Text style={styles.metricLabel}>Members joined</Text>
          <Text style={styles.progressPercent}>{memberCount} of {memberLimit}</Text>
        </View>
        <ProgressBar progress={memberLimit ? (memberCount / memberLimit) * 100 : 0} color="#005B7F" height={9} />
      </Card>

      <Card style={styles.spotlightCard}>
        <Text style={styles.spotlightLabel}>YOUR PAYOUT TURN</Text>
        <Text style={styles.spotlightTitle}>
          {myMember ? `Turn #${myMember.payout_position}` : 'Join to receive a payout turn'}
        </Text>
        <Text style={styles.spotlightSub}>
          {myMember
            ? `Estimated payout date: ${formatDate(myMember.payout_date)}`
            : `Payout positions are assigned in join order. The first date is ${circle?.start_date ? formatDate(circle.start_date) : 'set by the creator'}.`}
        </Text>
      </Card>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Payout schedule</Text>
        <Text style={styles.sectionSub}>{memberLimit} turns</Text>
      </View>

      {members.map((member) => {
        const isCurrentUser = member.user_id === user?.id;
        return (
          <View key={member.user_id} style={[styles.scheduleRow, isCurrentUser && styles.scheduleRowUser]}>
            <View style={[styles.turnBadge, isCurrentUser && styles.turnBadgeUser]}>
              <Text style={[styles.turnNum, isCurrentUser && styles.turnNumUser]}>
                #{member.payout_position}
              </Text>
            </View>
            <View style={styles.memberDetails}>
              <Text style={[styles.memberName, isCurrentUser && styles.memberNameUser]}>
                {`${member.first_name} ${member.last_name}`.trim() || 'Circle member'}{isCurrentUser ? ' (You)' : ''}
              </Text>
              <Text style={styles.memberDate}>Estimated: {formatDate(member.payout_date)}</Text>
            </View>
          </View>
        );
      })}

      {memberCount < memberLimit && (
        <Text style={styles.openSlotsText}>
          {memberLimit - memberCount} {memberLimit - memberCount === 1 ? 'payout turn is' : 'payout turns are'} awaiting members.
        </Text>
      )}
      {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
      <Text style={styles.disclaimer}>Payout dates are estimates based on the circle start date and contribution frequency.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F6F9F9', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  headerCard: { marginBottom: 16, padding: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cycleBadge: { fontSize: 12, fontWeight: '700', color: '#005B7F', backgroundColor: '#E6F3F7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  groupTitle: { fontSize: 22, fontWeight: '800', color: '#161C20', marginBottom: 16 },
  metricsGrid: { flexDirection: 'row', backgroundColor: '#F8FAF9', borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 16 },
  metricItem: { flex: 1 },
  metricDivider: { width: 1, height: 34, backgroundColor: '#E0E6E8', marginHorizontal: 12 },
  metricLabel: { fontSize: 11, color: '#737980', fontWeight: '600', marginBottom: 3 },
  metricVal: { fontSize: 14, fontWeight: '800', color: '#161C20' },
  metricValTeal: { fontSize: 15, fontWeight: '800', color: '#005B7F' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  progressPercent: { fontSize: 12, fontWeight: '700', color: '#005B7F' },
  spotlightCard: { backgroundColor: '#FFF8F9', borderColor: '#FCD7DC', borderWidth: 1, marginBottom: 22, padding: 18 },
  spotlightLabel: { color: '#E98591', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  spotlightTitle: { fontSize: 18, fontWeight: '800', color: '#161C20', marginBottom: 4 },
  spotlightSub: { fontSize: 12, color: '#737980', lineHeight: 17 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#161C20' },
  sectionSub: { fontSize: 12, color: '#737980', fontWeight: '600' },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EFEFEF' },
  scheduleRowUser: { borderColor: '#E98591', backgroundColor: '#FFFDFD', borderWidth: 1.5 },
  turnBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  turnBadgeUser: { backgroundColor: '#FFF0F2' },
  turnNum: { fontSize: 12, fontWeight: '800', color: '#737980' },
  turnNumUser: { color: '#E98591' },
  memberDetails: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '700', color: '#161C20' },
  memberNameUser: { color: '#005B7F' },
  memberDate: { fontSize: 11, color: '#737980', marginTop: 2 },
  openSlotsText: { color: '#737980', fontSize: 12, marginTop: 4 },
  errorText: { color: '#B42318', fontSize: 12, marginTop: 12 },
  disclaimer: { color: '#737980', fontSize: 11, lineHeight: 16, marginTop: 18 },
});