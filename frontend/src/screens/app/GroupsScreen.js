import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';

export const GroupsScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Savings Groups</Text>
        <Button
          title="+ New Group"
          variant="accent"
          onPress={() => navigation.navigate('CreateGroupStack')}
          style={styles.createBtn}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('GroupDetail', { groupId: 'g1' })}
      >
        <Card>
          <View style={styles.cardHeader}>
            <Text style={styles.groupName}>Lagos Traders Circle</Text>
            <StatusBadge label="Active" type="active" />
          </View>
          <Text style={styles.groupDetail}>Contribution: ₦50,000 / month</Text>
          <Text style={styles.groupDetail}>Members: 10/10</Text>
        </Card>
      </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161C20',
  },
  createBtn: {
    width: 'auto',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#161C20',
  },
  groupDetail: {
    fontSize: 13,
    color: '#737980',
    marginTop: 4,
  },
});
