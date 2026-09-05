import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export const WalletScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ecobank Blaze Wallet</Text>

      <Card style={styles.walletCard}>
        <Text style={styles.walletLabel}>Blaze Account Balance</Text>
        <Text style={styles.walletValue}>₦250,000</Text>
      </Card>

      <Button
        title="View Contribution History"
        variant="outline"
        onPress={() => navigation.navigate('ContributionHistory')}
        style={styles.historyBtn}
      />
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 16,
  },
  walletCard: {
    backgroundColor: '#00597C',
  },
  walletLabel: {
    fontSize: 14,
    color: '#E0F2FE',
  },
  walletValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
  },
  historyBtn: {
    marginTop: 16,
  },
});
