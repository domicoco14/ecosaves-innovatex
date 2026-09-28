import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InputField } from '../../../components/InputField';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';

export const CreateGroupStep2Screen = ({ route, navigation }) => {
  const step1Data = route.params || {};
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const previewTimeline = useMemo(() => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate);
    if (!match) return [];

    const [, yearText, monthText, dayText] = match;
    const year = Number(yearText);
    const month = Number(monthText) - 1;
    const day = Number(dayText);
    const start = new Date(year, month, day);
    if (start.getFullYear() !== year || start.getMonth() !== month || start.getDate() !== day) return [];

    const count = Number(step1Data.members_count) || 3;
    return Array.from({ length: count }, (_, index) => {
      const payoutDate = new Date(start);
      if (step1Data.frequency === 'Monthly') {
        const targetMonth = start.getMonth() + index;
        payoutDate.setDate(1);
        payoutDate.setMonth(targetMonth);
        const lastDay = new Date(payoutDate.getFullYear(), payoutDate.getMonth() + 1, 0).getDate();
        payoutDate.setDate(Math.min(day, lastDay));
      } else {
        payoutDate.setDate(start.getDate() + index * (step1Data.frequency === 'Bi-weekly' ? 14 : 7));
      }

      return {
        id: String(index + 1),
        name: index === 0 ? 'You (circle creator)' : `Member ${index + 1} (open slot)`,
        date: payoutDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
        isCreator: index === 0,
      };
    });
  }, [startDate, step1Data.frequency, step1Data.members_count]);

  const handleNext = () => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate.trim());
    if (!match) {
      Alert.alert('Invalid date', 'Enter the start date in YYYY-MM-DD format.');
      return;
    }

    const [, yearText, monthText, dayText] = match;
    const selectedDate = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
    if (
      selectedDate.getFullYear() !== Number(yearText) ||
      selectedDate.getMonth() !== Number(monthText) - 1 ||
      selectedDate.getDate() !== Number(dayText)
    ) {
      Alert.alert('Invalid date', 'Choose a real calendar date in YYYY-MM-DD format.');
      return;
    }

    navigation.navigate('CreateGroupStep3', {
      ...step1Data,
      start_date: startDate.trim(),
      payout_order: 'fixed',
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
            The creator is included in the member limit. Payout positions are assigned in join order.
          </Text>
        </View>

        <InputField
          label="START DATE *"
          placeholder="YYYY-MM-DD"
          value={startDate}
          onChangeText={setStartDate}
          autoCapitalize="none"
        />

        {/* PREVIEW ROTATION TIMELINE */}
        <Text style={styles.fieldLabel}>ESTIMATED PAYOUT DATES · JOIN ORDER</Text>
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
                <Text style={styles.memberTurnText}>Turn #{index + 1} • {item.date}</Text>
              </View>

              {item.isCreator ? (
                <View style={styles.badgeCoral}>
                  <Text style={styles.badgeCoralText}>Joined</Text>
                </View>
              ) : (
                <View style={styles.badgeGray}>
                  <Text style={styles.badgeGrayText}>Open</Text>
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
