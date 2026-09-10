import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InputField } from '../../../components/InputField';
import { Button } from '../../../components/Button';

export const CreateGroupStep1Screen = ({ navigation }) => {
  const [groupName, setGroupName] = useState('Yaba Traders Ajo');
  const [contributionAmount, setContributionAmount] = useState('5,000');
  const [frequency, setFrequency] = useState('Weekly');
  const [membersCount, setMembersCount] = useState(12);

  const handleNext = () => {
    if (!groupName.trim() || !contributionAmount.trim()) {
      Alert.alert('Missing Info', 'Please enter a group name and contribution amount.');
      return;
    }

    navigation.navigate('CreateGroupStep2', {
      name: groupName.trim(),
      contribution_amount: contributionAmount,
      frequency,
      members_count: membersCount,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Deep Teal Step Header */}
      <View style={styles.stepHeader}>
        <View style={styles.stepHeaderTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.stepBadge}>Step 1 of 3</Text>
        </View>
        <Text style={styles.stepTitle}>Group Setup</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <InputField
          label="GROUP NAME *"
          placeholder="Yaba Traders Ajo"
          value={groupName}
          onChangeText={setGroupName}
        />

        <InputField
          label="CONTRIBUTION AMOUNT *"
          placeholder="₦ 5,000"
          keyboardType="numeric"
          value={contributionAmount}
          onChangeText={setContributionAmount}
        />

        {/* CONTRIBUTION FREQUENCY SELECTOR */}
        <Text style={styles.fieldLabel}>CONTRIBUTION FREQUENCY *</Text>
        <View style={styles.segmentedContainer}>
          {['Weekly', 'Bi-weekly', 'Monthly'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.segmentBtn,
                frequency === item && styles.segmentBtnActive,
              ]}
              onPress={() => setFrequency(item)}
            >
              <Text
                style={[
                  styles.segmentText,
                  frequency === item && styles.segmentTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* NUMBER OF MEMBERS STEPPER */}
        <Text style={styles.fieldLabel}>NUMBER OF MEMBERS *</Text>
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setMembersCount((prev) => Math.max(3, prev - 1))}
          >
            <Text style={styles.stepperBtnText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.stepperValText}>{membersCount} members</Text>

          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setMembersCount((prev) => Math.min(30, prev + 1))}
          >
            <Text style={styles.stepperBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.stepperHint}>
          Ajo rotation typically operates best between 3 to 12 members.
        </Text>

        <Button
          title="Next: Payout Schedule"
          onPress={handleNext}
          style={styles.nextBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F9F9',
  },
  stepHeader: {
    backgroundColor: '#005B7F',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  stepHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  stepBadge: {
    color: '#BAE6FD',
    fontSize: 12,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#737980',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEFF2',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#005B7F',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#737980',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 6,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F0F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#005B7F',
  },
  stepperValText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#161C20',
  },
  stepperHint: {
    fontSize: 11,
    color: '#737980',
    marginBottom: 24,
  },
  nextBtn: {
    backgroundColor: '#005B7F',
    borderRadius: 16,
    height: 52,
    marginTop: 12,
  },
});
