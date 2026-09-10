import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InputField } from '../../../components/InputField';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { useAuthStore } from '../../../store/authStore';

export const CreateGroupStep2Screen = ({ route, navigation }) => {
  const step1Data = route.params || {};
  const user = useAuthStore((state) => state.user);

  const [startDate, setStartDate] = useState('September 5, 2026');
  const [payoutOrder, setPayoutOrder] = useState('Fixed');

  const previewTimeline = [
    { id: '1', name: 'Amina Bello', turn: 'Turn #1', date: 'Sep 14', status: 'Paid Out', isUser: false },
    { id: '2', name: 'Chuka Okafor', turn: 'Turn #2', date: 'Oct 28', status: 'Pending', isUser: false },
    { id: '3', name: `${user?.first_name || 'Dominion'} (You)`, turn: 'Turn #3', date: 'Nov 11', status: 'Your Turn', isUser: true },
    { id: '4', name: 'Mrs. Adeyemi', turn: 'Turn #4', date: 'Nov 25', status: 'Pending', isUser: false },
  ];

  const handleNext = () => {
    if (!startDate.trim()) {
      Alert.alert('Missing Info', 'Please specify a start date for the group.');
      return;
    }

    navigation.navigate('CreateGroupStep3', {
      ...step1Data,
      start_date: startDate.trim(),
      payout_order: payoutOrder,
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
          <Text style={styles.stepBadge}>Step 2 of 3</Text>
        </View>
        <Text style={styles.stepTitle}>Payout Schedule</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Info Callout Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            EcoSaves rotates the pooled funds securely. Choose how turns are assigned below.
          </Text>
        </View>

        <InputField
          label="START DATE *"
          placeholder="September 5, 2026"
          value={startDate}
          onChangeText={setStartDate}
        />

        {/* PAYOUT ORDER ASSIGNMENT SELECTOR */}
        <Text style={styles.fieldLabel}>PAYOUT ORDER ASSIGNMENT *</Text>
        <View style={styles.segmentedContainer}>
          {['Random', 'Fixed', 'Bidding'].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.segmentBtn,
                payoutOrder === item && styles.segmentBtnActive,
              ]}
              onPress={() => setPayoutOrder(item)}
            >
              <Text
                style={[
                  styles.segmentText,
                  payoutOrder === item && styles.segmentTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* PREVIEW ROTATION TIMELINE */}
        <Text style={styles.fieldLabel}>PREVIEW ROTATION TIMELINE</Text>
        <Card style={styles.timelineCard}>
          {previewTimeline.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.timelineRow,
                index < previewTimeline.length - 1 && styles.timelineBorder,
              ]}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>

              <View style={styles.timelineDetails}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberTurnText}>{item.turn} • {item.date}</Text>
              </View>

              {item.isUser ? (
                <View style={styles.badgeCoral}>
                  <Text style={styles.badgeCoralText}>{item.status}</Text>
                </View>
              ) : item.status === 'Paid Out' ? (
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeGreenText}>{item.status}</Text>
                </View>
              ) : (
                <View style={styles.badgeGray}>
                  <Text style={styles.badgeGrayText}>{item.status}</Text>
                </View>
              )}
            </View>
          ))}
        </Card>

        <Button
          title="Next: Review & Invite"
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E6F3F7',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#005B7F',
    fontWeight: '600',
    lineHeight: 17,
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
    marginBottom: 20,
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
  timelineCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  timelineBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F5',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D0E3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#005B7F',
  },
  timelineDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#161C20',
  },
  memberTurnText: {
    fontSize: 11,
    color: '#737980',
    marginTop: 2,
  },
  badgeCoral: {
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeCoralText: {
    color: '#E98591',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeGreen: {
    backgroundColor: '#E6F5EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGreenText: {
    color: '#29875A',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeGray: {
    backgroundColor: '#F0F3F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGrayText: {
    color: '#737980',
    fontSize: 11,
    fontWeight: '600',
  },
  nextBtn: {
    backgroundColor: '#005B7F',
    borderRadius: 16,
    height: 52,
  },
});
