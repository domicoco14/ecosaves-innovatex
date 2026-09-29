import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { ProgressBar } from '../../components/ProgressBar';
import { AvatarStack } from '../../components/AvatarStack';
import { api } from '../../lib/api';

export const GroupsScreen = ({ navigation }) => {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadCircles = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await api.get('/circles/');
      setCircles(response.data);
    } catch (err) {
      setLoadError(err.response?.data?.detail || 'Could not load your circles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadCircles();
  }, [loadCircles]));

  const activeGroups = circles.filter((circle) => circle.status !== 'completed');
  const completedGroups = circles.filter((circle) => circle.status === 'completed');

  const renderCircle = (circle, completed = false) => {
    const memberCount = circle.members_count || 0;
    const progress = Math.min(100, Math.round((memberCount / circle.member_limit) * 100));
    const amount = `₦${(Number(circle.contribution_amount) || 0).toLocaleString()}`;
    const frequency = circle.frequency?.replace('-', ' ') || 'cycle';
    const badge = completed ? 'Completed' : circle.status === 'active' ? 'Active' : 'Forming';

    return (
      <TouchableOpacity
        key={circle.id}
        activeOpacity={0.88}
        onPress={() => navigation.navigate('GroupDetail', { group: circle })}
      >
        <Card style={[styles.groupCard, completed && styles.completedCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Text style={styles.iconText}>🏡</Text>
            </View>
            <View style={styles.titleBlock}>
              <Text style={styles.groupName}>{circle.name}</Text>
              <Text style={styles.groupSub}>
                {memberCount}/{circle.member_limit} members • {amount}/{frequency}
              </Text>
            </View>
            <StatusBadge label={badge} type={completed ? 'muted' : circle.status === 'active' ? 'active' : 'pending'} />
          </View>

          <View style={styles.cardFooter}>
            <AvatarStack count={memberCount} size={22} />
            <View style={styles.barBlock}>
              <ProgressBar progress={progress} color={completed ? '#29875A' : '#E98591'} height={6} />
              <Text style={styles.barText}>{memberCount} of {circle.member_limit} members joined</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Sleek Top Header Bar */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.pageTitle}>Your Groups</Text>
            <Text style={styles.pageSubtitle}>
              {activeGroups.length} Active/Forming • {completedGroups.length} Completed
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.newGroupHeaderBtn}
              onPress={() => navigation.navigate('CreateGroupStack')}
              activeOpacity={0.8}
            >
              <Text style={styles.newGroupHeaderBtnText}>+ Create</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ACTIVE SECTION */}
        <Text style={styles.sectionLabel}>ACTIVE &amp; FORMING</Text>
        {loading ? <Text style={styles.stateText}>Loading your circles…</Text> : null}
        {!loading && loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}
        {!loading && !loadError && activeGroups.length === 0 ? (
          <Text style={styles.stateText}>You have not joined or created a circle yet.</Text>
        ) : null}
        {!loading && !loadError ? activeGroups.map((circle) => renderCircle(circle)) : null}

        {/* COMPLETED SECTION */}
        {completedGroups.length > 0 ? <Text style={styles.sectionLabel}>COMPLETED</Text> : null}

        {!loading && !loadError ? completedGroups.map((circle) => renderCircle(circle, true)) : null}

        <Button
          title="Join a Circle with a Code"
          onPress={() => navigation.navigate('JoinCircle')}
          style={styles.joinBtn}
        />
        <Button
          title="+ Create a Circle"
          onPress={() => navigation.navigate('CreateGroupStack')}
          style={styles.createBtn}
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
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#161C20',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#737980',
    marginTop: 2,
    fontWeight: '500',
  },
  newGroupHeaderBtn: {
    backgroundColor: '#005B7F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  newGroupHeaderBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#737980',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 10,
  },
  groupCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  completedCard: {
    backgroundColor: '#FAFCFC',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF0F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  titleBlock: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#161C20',
  },
  groupSub: {
    fontSize: 12,
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
  badgeCompleted: {
    backgroundColor: '#E6F5EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeCompletedText: {
    color: '#29875A',
    fontSize: 11,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F3F5',
    paddingTop: 12,
  },
  barBlock: {
    flex: 1,
    marginLeft: 16,
  },
  barText: {
    fontSize: 11,
    color: '#737980',
    marginTop: 4,
    textAlign: 'right',
  },
  stateText: {
    color: '#737980',
    fontSize: 13,
    marginBottom: 14,
  },
  errorText: {
    color: '#B42318',
    fontSize: 13,
    marginBottom: 14,
  },
  createBtn: {
    backgroundColor: '#005B7F',
    borderRadius: 16,
    height: 52,
    marginTop: 10,
  },
  joinBtn: {
    marginTop: 16,
    backgroundColor: '#005B7F',
    borderRadius: 16,
    height: 52,
  },
});
