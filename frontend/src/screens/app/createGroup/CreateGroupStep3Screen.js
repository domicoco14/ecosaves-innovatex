import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { KeyboardAwareScrollView } from '../../../components/KeyboardAwareScrollView';
import { KeyboardAwareView } from '../../../components/KeyboardAwareView';
import { api } from '../../../lib/api';
import * as Clipboard from 'expo-clipboard';

export const CreateGroupStep3Screen = ({ route, navigation }) => {
  const groupData = route.params || {};
  const [loading, setLoading] = useState(false);
  const [createdCircle, setCreatedCircle] = useState(null);
  const [copied, setCopied] = useState(false);

  const groupName = String(groupData.name || '').trim();
  const contribution = String(groupData.contribution_amount || '');
  const frequency = groupData.frequency || '';
  const membersCount = Number(groupData.members_count) || 0;
  const startDate = groupData.start_date || '';
  const payoutOrder = 'Join order';

  // Calculate total pool size
  const numericContrib = Number(contribution.replace(/[^0-9.]/g, '')) || 0;
  const totalPoolSize = `₦${(numericContrib * membersCount).toLocaleString()}`;
  const inviteUrl = createdCircle?.invite_slug
    ? `https://ecosaves.app/join/${createdCircle.invite_slug}`
    : '';

  const handleShareInvite = async () => {
    if (!createdCircle?.invite_slug) return;
    const message = `Join my EcoSaves circle, ${groupName}: ${inviteUrl}\n\nIf the link does not open the app, sign in, choose Groups → Join, and enter: ${createdCircle.invite_slug}`;
    try {
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;
      if (await Linking.canOpenURL(whatsappUrl)) {
        await Linking.openURL(whatsappUrl);
        return;
      }
    } catch {
      // Fall through to the system share sheet.
    }
    try {
      await Share.share({ title: `Join ${groupName} on EcoSaves`, message });
    } catch {
      Alert.alert('Unable to share', 'Please copy the invitation link and share it manually.');
    }
  };

  const handleCopyInvite = async () => {
    if (!inviteUrl) return;
    await Clipboard.setStringAsync(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    if (createdCircle) {
      navigation.getParent()?.navigate('MainTabs', { screen: 'Groups' });
      return;
    }

    if (!groupName || numericContrib <= 0 || !membersCount || !frequency || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      Alert.alert('Circle details missing', 'Go back and complete each circle setup step before creating it.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: groupName,
        contribution_amount: numericContrib,
        frequency: frequency.toLowerCase(),
        member_limit: membersCount,
        start_date: startDate,
      };

      const response = await api.post('/circles/', payload);
      setCreatedCircle(response.data);
    } catch (err) {
      Alert.alert(
        'Circle not created',
        err.response?.data?.detail || err.message || 'Could not create the circle. Check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareView>
      {/* Deep Teal Step Header */}
      <View style={styles.stepHeader}>
        <View style={styles.stepHeaderTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.stepBadge}>Step 3 of 3</Text>
        </View>
        <Text style={styles.stepTitle}>Review Group</Text>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* GROUP DETAILS SUMMARY CARD */}
        <Text style={styles.sectionLabel}>GROUP DETAILS SUMMARY</Text>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Group Name</Text>
            <Text style={styles.summaryVal}>{groupName || 'Not set'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Contribution</Text>
            <Text style={styles.summaryVal}>{numericContrib ? `₦${numericContrib.toLocaleString()} / ${frequency}` : 'Not set'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Pool Size</Text>
            <Text style={styles.summaryValTeal}>{totalPoolSize}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Cycle Members</Text>
            <Text style={styles.summaryVal}>{membersCount || '—'} savings slots (including you)</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Start Date</Text>
            <Text style={styles.summaryVal}>{startDate || 'Not set'}</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.summaryLabel}>Payout Order</Text>
            <Text style={styles.summaryVal}>{payoutOrder}</Text>
          </View>
        </Card>

        {/* A real, readable invite URL is available after the circle has been saved. */}
        <Text style={styles.sectionLabel}>INVITE SAVINGS BUDDIES</Text>
        <Card style={styles.inviteCard}>
          {createdCircle ? (
            <>
              <Text style={styles.inviteSub}>
                Share this link with your members. Joining requires an EcoSaves account.
              </Text>
              <View style={styles.linkBox}>
                <Text selectable style={styles.linkText} numberOfLines={1}>{inviteUrl}</Text>
                <TouchableOpacity style={styles.copyBtn} activeOpacity={0.85} onPress={handleCopyInvite}>
                  <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>
              <Text selectable style={styles.inviteCode}>Invite code: {createdCircle.invite_slug}</Text>
              <TouchableOpacity style={styles.whatsAppBtn} activeOpacity={0.85} onPress={handleShareInvite}>
                <Text style={styles.whatsAppIcon}>↗</Text>
                <Text style={styles.whatsAppBtnText}>Share via WhatsApp</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.inviteSub}>
              Create the circle first to generate its invitation code.
            </Text>
          )}
        </Card>

        <Button
          title={createdCircle ? 'Go to My Circles' : 'Create Circle'}
          loading={loading}
          onPress={handleConfirm}
          style={styles.createBtn}
        />
      </KeyboardAwareScrollView>
      </KeyboardAwareView>
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#737980',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  summaryCard: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F5',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#737980',
    fontWeight: '600',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#161C20',
  },
  summaryValTeal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#005B7F',
  },
  inviteCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },
  inviteSub: {
    fontSize: 12,
    color: '#737980',
    lineHeight: 17,
    marginBottom: 14,
  },
  inviteCode: {
    backgroundColor: '#F0F4F6',
    borderRadius: 12,
    color: '#005B7F',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 14,
    padding: 12,
    textAlign: 'center',
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F6',
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    marginBottom: 14,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#005B7F',
  },
  copyBtn: {
    backgroundColor: '#005B7F',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  whatsAppBtn: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    borderRadius: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsAppIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  whatsAppBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  createBtn: {
    backgroundColor: '#005B7F',
    borderRadius: 16,
    height: 52,
  },
});
