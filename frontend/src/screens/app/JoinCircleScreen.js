import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { InputField } from '../../components/InputField';
import { api } from '../../lib/api';

export const JoinCircleScreen = ({ navigation }) => {
  const [circleCode, setCircleCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const circleId = circleCode.trim();
    if (!circleId) {
      Alert.alert('Invitation code required', 'Enter the code shared by the circle creator.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/circles/join', { invite_code: circleId });
      Alert.alert('You joined the circle', `${response.data.name} has been added to your groups.`, [
        {
          text: 'View circle',
          onPress: () => navigation.navigate('GroupDetail', { group: response.data }),
        },
      ]);
    } catch (err) {
      Alert.alert(
        'Could not join circle',
        err.response?.data?.detail || 'Check the invitation code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Join a circle</Text>
        <Text style={styles.subtitle}>Enter the invitation code shared by the circle creator.</Text>

        <Card style={styles.card}>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              You need to be signed in to join. Your payout position is assigned when you join.
            </Text>
          </View>
          <InputField
            label="INVITATION CODE"
            value={circleCode}
            onChangeText={setCircleCode}
            placeholder="Paste circle code"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button title="Join circle" loading={loading} onPress={handleJoin} style={styles.button} />
        </Card>
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 36,
  },
  title: {
    color: '#161C20',
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    color: '#737980',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 22,
  },
  card: {
    borderRadius: 18,
    padding: 18,
  },
  infoBox: {
    backgroundColor: '#E6F3F7',
    borderColor: '#BAE6FD',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
    padding: 12,
  },
  infoText: {
    color: '#005B7F',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#005B7F',
    borderRadius: 16,
    height: 52,
  },
});