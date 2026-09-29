import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

const formatNaira = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

export const HomeScreen = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const [circles, setCircles] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    const [circleResult, savingsResult] = await Promise.allSettled([
      api.get('/circles/'),
      api.get('/savings/'),
    ]);
    if (circleResult.status === 'fulfilled') setCircles(circleResult.value.data);
    if (savingsResult.status === 'fulfilled') setPlans(savingsResult.value.data);
    const failures = [circleResult, savingsResult].filter((result) => result.status === 'rejected');
    if (failures.length) {
      const firstError = failures[0].reason;
      setError(firstError.response?.data?.detail || firstError.message || 'Some dashboard data could not be loaded.');
    }
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => {
    loadDashboard();
  }, [loadDashboard]));

  const firstName = user?.first_name || 'Member';
  const totalReported = plans.reduce((sum, plan) => sum + Number(plan.saved_amount || 0), 0);
  const totalTargets = plans.reduce((sum, plan) => sum + Number(plan.target_amount || 0), 0);
  const progress = totalTargets ? Math.min(100, totalReported / totalTargets * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text></View>
          <View style={styles.greeting}>
            <Text style={styles.greetingSub}>Welcome back</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileLink}>Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{loading ? '—' : circles.length}</Text>
            <Text style={styles.statLabel}>Circles</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{loading ? '—' : plans.length}</Text>
            <Text style={styles.statLabel}>Savings plans</Text>
          </Card>
        </View>

        <Card style={styles.savingsCard}>
          <Text style={styles.cardEyebrow}>SELF-REPORTED SAVINGS</Text>
          <Text style={styles.balance}>{formatNaira(totalReported)}</Text>
          <ProgressBar progress={progress} color="#38BDF8" height={8} />
          <Text style={styles.progressText}>
            {plans.length ? `${Math.round(progress)}% of combined targets · ${formatNaira(totalTargets)}` : 'Create a plan to set your savings target'}
          </Text>
          <TouchableOpacity style={styles.lightButton} onPress={() => navigation.navigate('Wallet')}>
            <Text style={styles.lightButtonText}>{plans.length ? 'View savings plans' : 'Create a savings plan'}</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>No funds are held, transferred, or locked by this tracker.</Text>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your circles</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Groups')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {loading ? <Text style={styles.stateText}>Loading your data…</Text> : null}
        {!loading && error ? <Text style={styles.errorText}>{error}</Text> : null}
        {!loading && circles.length === 0 && !error ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No circles yet</Text>
            <Text style={styles.stateText}>Create a circle or join one with an invitation code.</Text>
            <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('Groups')}>
              <Text style={styles.outlineButtonText}>Explore circles</Text>
            </TouchableOpacity>
          </Card>
        ) : null}

        {circles.slice(0, 3).map((circle) => {
          const memberCount = Number(circle.members_count || 0);
          const memberLimit = Number(circle.member_limit || 0);
          const fill = memberLimit ? memberCount / memberLimit * 100 : 0;
          return (
            <TouchableOpacity key={circle.id} activeOpacity={0.86} onPress={() => navigation.navigate('GroupDetail', { group: circle })}>
              <Card style={styles.circleCard}>
                <View style={styles.circleHeader}>
                  <View style={styles.circleInfo}>
                    <Text style={styles.circleName}>{circle.name}</Text>
                    <Text style={styles.circleMeta}>
                      {memberCount}/{memberLimit} members · {formatNaira(circle.contribution_amount)}/{circle.frequency}
                    </Text>
                  </View>
                  <StatusBadge label={circle.status === 'active' ? 'Active' : 'Forming'} type={circle.status === 'active' ? 'active' : 'pending'} />
                </View>
                <ProgressBar progress={fill} color="#E98591" height={6} />
                <Text style={styles.circleProgress}>{memberCount} of {memberLimit} members joined</Text>
              </Card>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('CreateGroupStack')}>
          <Text style={styles.primaryButtonText}>+ Create a circle</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F9F9' },
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36 },
  header: { alignItems: 'center', flexDirection: 'row', marginBottom: 20 },
  avatar: { alignItems: 'center', backgroundColor: '#005B7F', borderRadius: 22, height: 44, justifyContent: 'center', marginRight: 12, width: 44 },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  greeting: { flex: 1 },
  greetingSub: { color: '#737980', fontSize: 12 },
  name: { color: '#161C20', fontSize: 18, fontWeight: '800', marginTop: 2 },
  profileLink: { color: '#005B7F', fontSize: 13, fontWeight: '800' },
  statsRow: { flexDirection: 'row', marginBottom: 14 },
  statCard: { alignItems: 'center', flex: 1, marginRight: 8, padding: 12 },
  statValue: { color: '#005B7F', fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#737980', fontSize: 11, marginTop: 3 },
  savingsCard: { backgroundColor: '#005B7F', marginBottom: 24, padding: 20 },
  cardEyebrow: { color: '#BAE6FD', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  balance: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginVertical: 12 },
  progressText: { color: '#D9F1FB', fontSize: 11, marginTop: 7 },
  lightButton: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 18, paddingVertical: 12 },
  lightButtonText: { color: '#005B7F', fontSize: 13, fontWeight: '800' },
  disclaimer: { color: '#D9F1FB', fontSize: 10, lineHeight: 15, marginTop: 12 },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: '#161C20', fontSize: 19, fontWeight: '800' },
  seeAll: { color: '#005B7F', fontSize: 13, fontWeight: '800' },
  stateText: { color: '#737980', fontSize: 12, lineHeight: 18 },
  errorText: { color: '#B42318', fontSize: 12, marginBottom: 12 },
  emptyCard: { marginBottom: 14, padding: 16 },
  emptyTitle: { color: '#161C20', fontSize: 15, fontWeight: '800', marginBottom: 5 },
  outlineButton: { alignItems: 'center', borderColor: '#005B7F', borderRadius: 12, borderWidth: 1, marginTop: 12, paddingVertical: 10 },
  outlineButtonText: { color: '#005B7F', fontSize: 12, fontWeight: '800' },
  circleCard: { marginBottom: 12, padding: 16 },
  circleHeader: { alignItems: 'center', flexDirection: 'row', marginBottom: 13 },
  circleInfo: { flex: 1, marginRight: 8 },
  circleName: { color: '#161C20', fontSize: 14, fontWeight: '800' },
  circleMeta: { color: '#737980', fontSize: 11, marginTop: 4 },
  circleProgress: { color: '#737980', fontSize: 10, marginTop: 6, textAlign: 'right' },
  primaryButton: { alignItems: 'center', backgroundColor: '#005B7F', borderRadius: 16, marginTop: 10, paddingVertical: 15 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});