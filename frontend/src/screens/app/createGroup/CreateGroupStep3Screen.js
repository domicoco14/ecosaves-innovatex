import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ProgressBar } from '../../../components/ProgressBar';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';

export const CreateGroupStep3Screen = ({ route, navigation }) => {
  const groupData = route.params || {};

  const handleConfirm = () => {
    // Navigate back to Groups screen or group detail
    navigation.getParent()?.navigate('MainTabs', { screen: 'Groups' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Progress bar for Step 3 of 3 (100%) */}
      <View style={styles.progressContainer}>
        <Text style={styles.stepLabel}>Step 3 of 3: Review Group</Text>
        <ProgressBar progress={100} color="#29875A" />
      </View>

      <Text style={styles.title}>Review & Create</Text>
      <Text style={styles.subtitle}>Confirm your new Ajo/Esusu group details</Text>

      <Card>
        <Text style={styles.label}>Group Name</Text>
        <Text style={styles.value}>{groupData.groupName || 'Lagos Traders Circle'}</Text>

        <Text style={styles.label}>Contribution Amount</Text>
        <Text style={styles.value}>₦{groupData.contributionAmount || '50,000'}</Text>

        <Text style={styles.label}>Frequency</Text>
        <Text style={styles.value}>{groupData.frequency || 'Monthly'}</Text>

        <Text style={styles.label}>Max Members</Text>
        <Text style={styles.value}>{groupData.maxMembers || '10'}</Text>
      </Card>

      <Button title="Create Group" variant="accent" onPress={handleConfirm} style={styles.button} />
      <Button title="Back" variant="ghost" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F6F9F9',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#29875A',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#737980',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#737980',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#161C20',
    marginTop: 2,
  },
  button: {
    marginTop: 24,
  },
});
