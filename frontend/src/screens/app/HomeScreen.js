import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export const HomeScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Hello, Welcome Back!</Text>

      {/* Main Balance Card */}
      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Savings Balance</Text>
        <Text style={styles.balanceValue}>₦145,000</Text>
        <Text style={styles.blazeNote}>Secured via Ecobank Blaze</Text>
      </Card>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionRow}>
        <Button
          title="Create Group"
          variant="accent"
          onPress={() => navigation.navigate('CreateGroupStack')}
          style={styles.halfBtn}
        />
        <Button
          title="View Groups"
          variant="outline"
          onPress={() => navigation.navigate('Groups')}
          style={styles.halfBtn}
        />
      </View>
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
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 16,
  },
  balanceCard: {
    backgroundColor: '#00597C',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#E0F2FE',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginVertical: 8,
  },
  blazeNote: {
    fontSize: 12,
    color: '#BAE6FD',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#161C20',
    marginTop: 20,
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfBtn: {
    width: '48%',
  },
});
