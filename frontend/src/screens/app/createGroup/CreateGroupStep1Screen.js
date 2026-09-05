import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ProgressBar } from '../../../components/ProgressBar';
import { InputField } from '../../../components/InputField';
import { Button } from '../../../components/Button';

export const CreateGroupStep1Screen = ({ navigation }) => {
  const [groupName, setGroupName] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');

  const handleNext = () => {
    navigation.navigate('CreateGroupStep2', {
      groupName,
      contributionAmount,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Progress bar for Step 1 of 3 (33%) */}
      <View style={styles.progressContainer}>
        <Text style={styles.stepLabel}>Step 1 of 3: Group Setup</Text>
        <ProgressBar progress={33} color="#00597C" />
      </View>

      <Text style={styles.title}>Create Savings Group</Text>
      <Text style={styles.subtitle}>Set up the basic details for your Ajo/Esusu group</Text>

      <InputField
        label="Group Name"
        placeholder="e.g. Lagos Traders Circle"
        value={groupName}
        onChangeText={setGroupName}
      />

      <InputField
        label="Contribution Amount (₦)"
        placeholder="e.g. 50000"
        keyboardType="numeric"
        value={contributionAmount}
        onChangeText={setContributionAmount}
      />

      <Button title="Next: Payout Schedule" onPress={handleNext} style={styles.button} />
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
    color: '#00597C',
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
  button: {
    marginTop: 24,
  },
});
