import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ProgressBar } from '../../../components/ProgressBar';
import { InputField } from '../../../components/InputField';
import { Button } from '../../../components/Button';

export const CreateGroupStep2Screen = ({ route, navigation }) => {
  const step1Data = route.params || {};
  const [frequency, setFrequency] = useState('Monthly');
  const [maxMembers, setMaxMembers] = useState('10');

  const handleNext = () => {
    navigation.navigate('CreateGroupStep3', {
      ...step1Data,
      frequency,
      maxMembers,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Progress bar for Step 2 of 3 (66%) */}
      <View style={styles.progressContainer}>
        <Text style={styles.stepLabel}>Step 2 of 3: Payout Schedule</Text>
        <ProgressBar progress={66} color="#00597C" />
      </View>

      <Text style={styles.title}>Payout Schedule</Text>
      <Text style={styles.subtitle}>Configure rotation frequency and member slots</Text>

      <InputField
        label="Rotation Frequency"
        placeholder="e.g. Weekly / Monthly"
        value={frequency}
        onChangeText={setFrequency}
      />

      <InputField
        label="Total Members Slot"
        placeholder="e.g. 10"
        keyboardType="numeric"
        value={maxMembers}
        onChangeText={setMaxMembers}
      />

      <Button title="Next: Review Group" onPress={handleNext} style={styles.button} />
      <Button
        title="Back"
        variant="ghost"
        onPress={() => navigation.goBack()}
      />
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
