import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';

export const ContributionHistoryScreen = () => {
  const mockHistory = [
    { id: '1', date: 'Aug 15, 2026', amount: '₦50,000', status: 'Completed', group: 'Lagos Traders Circle' },
    { id: '2', date: 'Jul 15, 2026', amount: '₦50,000', status: 'Completed', group: 'Lagos Traders Circle' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={mockHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.groupName}>{item.group}</Text>
              <StatusBadge label={item.status} type="success" />
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.amount}>{item.amount}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F9',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  itemCard: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#161C20',
  },
  itemBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#00597C',
  },
  date: {
    fontSize: 13,
    color: '#737980',
  },
});
