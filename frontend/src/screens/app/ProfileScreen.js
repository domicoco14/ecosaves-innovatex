import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

export const ProfileScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>

      <Card>
        <Text style={styles.name}>{user?.name || 'EcoSaves Member'}</Text>
        <Text style={styles.email}>{user?.email || 'user@ecosaves.app'}</Text>
      </Card>

      <Button title="Log Out" variant="accent" onPress={logout} style={styles.logoutBtn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9F9',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#161C20',
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#161C20',
  },
  email: {
    fontSize: 14,
    color: '#737980',
    marginTop: 4,
  },
  logoutBtn: {
    marginTop: 24,
  },
});
