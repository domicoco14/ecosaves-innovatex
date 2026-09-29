import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../lib/api';

const formatAmount = (amount) => `₦${Number(amount || 0).toLocaleString()}`;

export const ContributionHistoryScreen = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/savings/');
      const rows = response.data.flatMap((plan) => (plan.entries || []).map((entry) => ({
        ...entry,
        plan_name: plan.name,
      })));
      setEntries(rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Could not load your savings history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadEntries();
  }, [loadEntries]));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Savings activity</Text>
      <Text style={styles.subtitle}>Entries here are self-reported and not verified payments.</Text>
      {loading ? <Text style={styles.message}>Loading activity…</Text> : null}
      {!loading && error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && !error && entries.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No entries yet</Text>
          <Text style={styles.message}>When you log savings against a plan, they will appear here.</Text>
        </Card>
      ) : null}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.planName}>{item.plan_name}</Text>
              <StatusBadge label="Self-reported" type="pending" />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.amount}>{formatAmount(item.amount)}</Text>
              <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F9F9', paddingHorizontal: 20, paddingTop: 18 },
  title: { color: '#161C20', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#737980', fontSize: 12, lineHeight: 18, marginTop: 4, marginBottom: 16 },
  list: { paddingBottom: 24 },
  itemCard: { marginBottom: 12, padding: 16 },
  itemHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  planName: { color: '#161C20', flex: 1, fontSize: 14, fontWeight: '700', marginRight: 8 },
  itemBody: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  amount: { color: '#00597C', fontSize: 16, fontWeight: '800' },
  date: { color: '#737980', fontSize: 12 },
  note: { color: '#737980', fontSize: 12, marginTop: 8 },
  message: { color: '#737980', fontSize: 12, lineHeight: 18 },
  error: { color: '#B42318', fontSize: 12, marginBottom: 12 },
  emptyCard: { padding: 16 },
  emptyTitle: { color: '#161C20', fontSize: 15, fontWeight: '800', marginBottom: 5 },
});