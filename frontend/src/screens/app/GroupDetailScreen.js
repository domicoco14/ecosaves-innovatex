import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';

export const GroupDetailScreen = ({ route }) => {
  const groupId = route.params?.groupId || 'g1';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <StatusBadge label="Active Group" type="active" />
        <Text style={styles.groupTitle}>Lagos Traders Circle</Text>
        <Text style={styles.groupMeta}>Monthly Contribution: ₦50,000</Text>
        <Text style={styles.groupMeta}>Total Pool: ₦500,000</Text>
      </Card>

      <Button title="Pay Monthly Contribution" variant="accent" style={styles.payBtn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F6F9F9',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  groupTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161C20',
    marginTop: 8,
    marginBottom: 4,
  },
  groupMeta: {
    fontSize: 14,
    color: '#737980',
    marginTop: 4,
  },
  payBtn: {
    marginTop: 20,
  },
});
