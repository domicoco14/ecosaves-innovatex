import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../lib/api';

const todayIso = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const formatAmount = (amount) => `₦${Number(amount || 0).toLocaleString()}`;
const makeIdempotencyKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;

const TextEntry = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.inputBlock}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.textInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9EA5AD"
      keyboardType={keyboardType}
      autoCapitalize={keyboardType === 'default' ? 'sentences' : 'none'}
    />
  </View>
);

export const WalletScreen = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [entryPlan, setEntryPlan] = useState(null);
  const entryKey = useRef(makeIdempotencyKey());

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState(todayIso());
  const [maturityDate, setMaturityDate] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryNote, setEntryNote] = useState('');

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await api.get('/savings/');
      setPlans(response.data);
    } catch (err) {
      setLoadError(err.response?.data?.detail || err.message || 'Could not load savings plans.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadPlans();
  }, [loadPlans]));

  const resetCreateForm = () => {
    setName('');
    setTargetAmount('');
    setContributionAmount('');
    setFrequency('monthly');
    setStartDate(todayIso());
    setMaturityDate('');
  };

  const createPlan = async () => {
    const target = Number(targetAmount.replace(/,/g, ''));
    const contribution = Number(contributionAmount.replace(/,/g, ''));
    if (!name.trim() || !Number.isFinite(target) || target <= 0 || !Number.isFinite(contribution) || contribution <= 0) {
      Alert.alert('Check your details', 'Enter a plan name and positive target and scheduled contribution amounts.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(maturityDate) || maturityDate <= startDate) {
      Alert.alert('Check your dates', 'Use YYYY-MM-DD dates, and choose a maturity date after the start date.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/savings/', {
        name: name.trim(),
        target_amount: target,
        contribution_amount: contribution,
        frequency,
        start_date: startDate,
        maturity_date: maturityDate,
      });
      setShowCreate(false);
      resetCreateForm();
      await loadPlans();
    } catch (err) {
      Alert.alert('Plan not created', err.response?.data?.detail || err.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const recordEntry = async () => {
    const amount = Number(entryAmount.replace(/,/g, ''));
    if (!entryPlan || !Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Check the amount', 'Enter a positive amount to log.');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/savings/${entryPlan.id}/entries`, {
        amount,
        idempotency_key: entryKey.current,
        note: entryNote.trim() || null,
      });
      entryKey.current = makeIdempotencyKey();
      setEntryPlan(null);
      setEntryAmount('');
      setEntryNote('');
      await loadPlans();
    } catch (err) {
      Alert.alert('Entry not recorded', err.response?.data?.detail || err.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const totalReported = plans.reduce((total, plan) => total + Number(plan.saved_amount || 0), 0);
  const recentEntries = plans
    .flatMap((plan) => (plan.entries || []).map((entry) => ({ ...entry, planName: plan.name })))
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>EcoSaves Wallet</Text>
            <Text style={styles.subtitle}>Wallet balance and personal savings</Text>
          </View>
        </View>

        <Card style={styles.walletHeroCard}>
          <Text style={styles.walletLabel}>Available wallet balance</Text>
          <Text style={styles.walletAmount}>{formatAmount(0)}</Text>
          <View style={styles.walletActions}>
            <View style={[styles.walletAction, styles.walletActionDisabled]}>
              <Text style={styles.walletActionTextDisabled}>＋ Add funds</Text>
            </View>
            <View style={[styles.walletAction, styles.walletActionOutline]}>
              <Text style={styles.walletActionTextOutline}>↑ Withdraw</Text>
            </View>
          </View>
          <Text style={styles.walletNotice}>Payments are not connected. Wallet balance remains ₦0.</Text>
        </Card>

        <Text style={styles.sectionLabel}>LINKED ACCOUNT</Text>
        <Card style={styles.linkedCard}>
          <View style={styles.bankIcon}><Text style={styles.bankIconText}>▤</Text></View>
          <View style={styles.linkedCopy}>
            <Text style={styles.linkedTitle}>No account connected</Text>
            <Text style={styles.linkedSubtitle}>Bank linking will be available after a verified provider integration.</Text>
          </View>
        </Card>

        <View style={styles.activityHeader}>
          <View>
            <Text style={styles.sectionTitle}>Personal savings</Text>
            <Text style={styles.sectionSubtitle}>Self-reported tracking · {formatAmount(totalReported)}</Text>
          </View>
        </View>
        <Card style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Tracking only — no money is moved or locked</Text>
          <Text style={styles.noticeText}>
            Entries are reported by you and are not verified deposits. EcoSaves does not hold these funds or automatically release a payout.
          </Text>
        </Card>

        {loading ? <Text style={styles.stateText}>Loading your plans…</Text> : null}
        {!loading && loadError ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Savings plans unavailable</Text>
            <Text style={styles.emptyText}>{loadError}</Text>
            <Button title="Try again" onPress={loadPlans} style={styles.secondaryButton} />
          </Card>
        ) : null}
        {!loading && !loadError && plans.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No personal savings plans yet</Text>
            <Text style={styles.emptyText}>Create a target and maturity date to start tracking progress.</Text>
          </Card>
        ) : null}

        {!loadError && plans.map((plan) => {
          const saved = Number(plan.saved_amount || 0);
          const target = Number(plan.target_amount || 0);
          const progress = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
          const completed = plan.status === 'completed';
          const matured = plan.status === 'matured' || completed;
          return (
            <Card key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <View style={styles.planTitleBlock}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planSchedule}>
                    {formatAmount(plan.contribution_amount)} / {plan.frequency.replace('-', ' ')}
                  </Text>
                </View>
                <StatusBadge label={completed ? 'Target reached' : matured ? 'Matured' : 'Tracking'} type={matured ? 'muted' : 'active'} />
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.savedAmount}>{formatAmount(saved)}</Text>
                <Text style={styles.targetAmount}>of {formatAmount(target)}</Text>
              </View>
              <ProgressBar progress={progress} color="#005B7F" height={8} />
              <Text style={styles.maturityText}>Target date: {plan.maturity_date}</Text>
              <Text style={styles.entriesText}>
                {plan.entries?.length || 0} self-reported {plan.entries?.length === 1 ? 'entry' : 'entries'}
              </Text>
              {!matured ? (
                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={() => {
                    setEntryPlan(plan);
                    setEntryAmount('');
                    entryKey.current = makeIdempotencyKey();
                  }}
                  activeOpacity={0.82}
                >
                  <Text style={styles.recordButtonText}>+ Log a completed saving</Text>
                </TouchableOpacity>
              ) : null}
            </Card>
          );
        })}

        <View style={styles.activityHeader}>
          <View>
            <Text style={styles.sectionTitle}>Transaction history</Text>
            <Text style={styles.sectionSubtitle}>Only your saved tracking entries</Text>
          </View>
          {recentEntries.length > 0 ? (
            <TouchableOpacity onPress={() => navigation.navigate('ContributionHistory')}>
              <Text style={styles.historyLink}>See all</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {recentEntries.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No savings activity yet</Text>
            <Text style={styles.emptyText}>Real wallet transactions will appear only after a verified payment provider is connected.</Text>
          </Card>
        ) : recentEntries.map((entry) => (
          <Card key={entry.id} style={styles.transactionCard}>
            <View style={styles.transactionIcon}><Text style={styles.transactionIconText}>＋</Text></View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionTitle}>{entry.planName}</Text>
              <Text style={styles.transactionMeta}>
                Self-reported · {new Date(entry.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.transactionAmount}>{formatAmount(entry.amount)}</Text>
          </Card>
        ))}

        <Button title="+ Create a savings plan" onPress={() => setShowCreate(true)} style={styles.primaryButton} />
      </ScrollView>

      <Modal visible={showCreate} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.keyboardFrame} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create a plan</Text>
              <Text style={styles.modalSubtitle}>This creates a tracking plan only; it does not move or lock funds.</Text>
              <TextEntry label="PLAN NAME" value={name} onChangeText={setName} placeholder="e.g. School fees" />
              <TextEntry label="SAVINGS TARGET (₦)" value={targetAmount} onChangeText={setTargetAmount} placeholder="100000" keyboardType="decimal-pad" />
              <TextEntry label="PLANNED CONTRIBUTION (₦)" value={contributionAmount} onChangeText={setContributionAmount} placeholder="10000" keyboardType="decimal-pad" />

              <Text style={styles.inputLabel}>SCHEDULE</Text>
              <View style={styles.frequencyRow}>
                {['weekly', 'bi-weekly', 'monthly'].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.frequencyButton, frequency === item && styles.frequencyButtonActive]}
                    onPress={() => setFrequency(item)}
                  >
                    <Text style={[styles.frequencyText, frequency === item && styles.frequencyTextActive]}>
                      {item.replace('-', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextEntry label="START DATE (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} placeholder="2026-10-01" />
              <TextEntry label="MATURITY DATE (YYYY-MM-DD)" value={maturityDate} onChangeText={setMaturityDate} placeholder="2027-10-01" />
              <Button title="Save plan" loading={saving} onPress={createPlan} style={styles.primaryButton} />
              <TouchableOpacity onPress={() => { setShowCreate(false); resetCreateForm(); }} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={Boolean(entryPlan)} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setEntryPlan(null)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView style={styles.keyboardFrame} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
          >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log a saving</Text>
            <Text style={styles.modalSubtitle}>
              This is a self-reported record for “{entryPlan?.name}”, not a payment or verified deposit.
            </Text>
            <TextEntry label="AMOUNT (₦)" value={entryAmount} onChangeText={setEntryAmount} placeholder="5000" keyboardType="decimal-pad" />
            <TextEntry label="NOTE (OPTIONAL)" value={entryNote} onChangeText={setEntryNote} placeholder="Add a note" />
            <Button title="Record entry" loading={saving} onPress={recordEntry} style={styles.primaryButton} />
            <TouchableOpacity onPress={() => setEntryPlan(null)} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F9F9' },
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36 },
  header: { marginBottom: 18 },
  title: { color: '#161C20', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#737980', fontSize: 13, marginTop: 4 },
  totalAmount: { color: '#005B7F', fontSize: 22, fontWeight: '800', marginTop: 12 },
  walletHeroCard: { backgroundColor: '#005B7F', borderRadius: 20, marginBottom: 22, padding: 20 },
  walletLabel: { color: '#D9F1FB', fontSize: 13, fontWeight: '600' },
  walletAmount: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', marginVertical: 13 },
  walletActions: { flexDirection: 'row', marginBottom: 13 },
  walletAction: { alignItems: 'center', borderRadius: 12, flex: 1, justifyContent: 'center', minHeight: 46, paddingHorizontal: 8 },
  walletActionDisabled: { backgroundColor: '#FFFFFF', marginRight: 8, opacity: 0.68 },
  walletActionOutline: { borderColor: 'rgba(255,255,255,0.55)', borderWidth: 1 },
  walletActionTextDisabled: { color: '#005B7F', fontSize: 13, fontWeight: '800' },
  walletActionTextOutline: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  walletNotice: { color: '#D9F1FB', fontSize: 11, lineHeight: 16 },
  sectionLabel: { color: '#737980', fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 9 },
  linkedCard: { alignItems: 'center', flexDirection: 'row', marginBottom: 22, padding: 15 },
  bankIcon: { alignItems: 'center', backgroundColor: '#E6F3F7', borderRadius: 13, height: 44, justifyContent: 'center', marginRight: 12, width: 44 },
  bankIconText: { color: '#005B7F', fontSize: 21, fontWeight: '800' },
  linkedCopy: { flex: 1 },
  linkedTitle: { color: '#161C20', fontSize: 13, fontWeight: '800' },
  linkedSubtitle: { color: '#737980', fontSize: 10, lineHeight: 15, marginTop: 3 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: '#161C20', fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { color: '#737980', fontSize: 11, marginTop: 3 },
  historyLink: { color: '#005B7F', fontSize: 12, fontWeight: '800' },
  transactionCard: { alignItems: 'center', flexDirection: 'row', marginBottom: 10, padding: 13 },
  transactionIcon: { alignItems: 'center', backgroundColor: '#E6F5EB', borderRadius: 18, height: 36, justifyContent: 'center', marginRight: 10, width: 36 },
  transactionIconText: { color: '#29875A', fontSize: 19, fontWeight: '800' },
  transactionDetails: { flex: 1 },
  transactionTitle: { color: '#161C20', fontSize: 12, fontWeight: '800' },
  transactionMeta: { color: '#737980', fontSize: 10, marginTop: 3 },
  transactionAmount: { color: '#29875A', fontSize: 13, fontWeight: '800' },
  noticeCard: { backgroundColor: '#FFF8E6', borderColor: '#F5D98B', borderWidth: 1, padding: 16, marginBottom: 18 },
  noticeTitle: { color: '#765300', fontSize: 13, fontWeight: '800', marginBottom: 6 },
  noticeText: { color: '#765300', fontSize: 12, lineHeight: 18 },
  stateText: { color: '#737980', fontSize: 13, marginBottom: 12 },
  emptyCard: { padding: 18, marginBottom: 14 },
  emptyTitle: { color: '#161C20', fontSize: 15, fontWeight: '800', marginBottom: 5 },
  emptyText: { color: '#737980', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  planCard: { padding: 16, marginBottom: 14 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  planTitleBlock: { flex: 1, marginRight: 10 },
  planName: { color: '#161C20', fontSize: 16, fontWeight: '800' },
  planSchedule: { color: '#737980', fontSize: 12, marginTop: 4 },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  savedAmount: { color: '#005B7F', fontSize: 20, fontWeight: '800', marginRight: 6 },
  targetAmount: { color: '#737980', fontSize: 12 },
  maturityText: { color: '#737980', fontSize: 11, marginTop: 10 },
  entriesText: { color: '#737980', fontSize: 11, marginTop: 4 },
  recordButton: { alignItems: 'center', borderColor: '#005B7F', borderRadius: 12, borderWidth: 1, marginTop: 14, paddingVertical: 11 },
  recordButtonText: { color: '#005B7F', fontSize: 13, fontWeight: '800' },
  primaryButton: { backgroundColor: '#005B7F', borderRadius: 16, height: 52, marginTop: 12 },
  secondaryButton: { backgroundColor: '#005B7F', borderRadius: 14, height: 46 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 20, 30, 0.58)' },
  keyboardFrame: { flex: 1 },
  modalScroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 40 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 20 },
  modalTitle: { color: '#161C20', fontSize: 20, fontWeight: '800' },
  modalSubtitle: { color: '#737980', fontSize: 12, lineHeight: 17, marginTop: 5, marginBottom: 16 },
  inputBlock: { marginBottom: 12 },
  inputLabel: { color: '#737980', fontSize: 10, fontWeight: '800', letterSpacing: 0.6, marginBottom: 6, textTransform: 'uppercase' },
  textInput: { backgroundColor: '#F4F6F8', borderColor: '#E5E8EB', borderRadius: 12, borderWidth: 1, color: '#161C20', fontSize: 14, height: 48, paddingHorizontal: 13 },
  frequencyRow: { flexDirection: 'row', marginBottom: 14 },
  frequencyButton: { alignItems: 'center', backgroundColor: '#F0F3F5', borderRadius: 10, flex: 1, marginRight: 5, paddingHorizontal: 4, paddingVertical: 10 },
  frequencyButtonActive: { backgroundColor: '#005B7F' },
  frequencyText: { color: '#737980', fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  frequencyTextActive: { color: '#FFFFFF' },
  cancelButton: { alignItems: 'center', paddingVertical: 13 },
  cancelText: { color: '#737980', fontSize: 14, fontWeight: '700' },
});