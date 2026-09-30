import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Linking, StyleSheet, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { tokenStorage } from '../lib/tokenStorage';
import { api } from '../lib/api';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setPendingInviteCode = useAuthStore((state) => state.setPendingInviteCode);
  const logout = useAuthStore((state) => state.logout);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let restoring = false;

    const captureInvite = (url) => {
      const match = url?.match(/(?:https:\/\/ecosaves\.app\/join\/|ecosaves:\/\/join\/)([a-z0-9-]+)/i);
      if (match?.[1]) setPendingInviteCode(match[1].toLowerCase().replace(/\/+$/, ''));
    };

    const linkSubscription = Linking.addEventListener('url', ({ url }) => captureInvite(url));

    const restoreSession = async () => {
      if (restoring) return;
      restoring = true;
      try {
        const token = await tokenStorage.getToken();
        if (!token) {
          if (!useAuthStore.getState().isAuthenticated) {
            useAuthStore.setState({ user: null, isAuthenticated: false });
          }
        } else {
          const response = await api.get('/users/me');
          useAuthStore.setState({ user: response.data, isAuthenticated: true });
        }
      } catch {
        if (!(await tokenStorage.getToken())) {
          useAuthStore.setState({ user: null, isAuthenticated: false });
        }
      } finally {
        restoring = false;
        if (mounted) setAuthReady(true);
      }
    };

    Linking.getInitialURL()
      .then(captureInvite)
      .catch(() => {})
      .finally(restoreSession);

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background') {
        logout();
      } else if (nextState === 'active' && authReady) {
        restoreSession();
      }
    });

    return () => {
      mounted = false;
      linkSubscription.remove();
      appStateSubscription.remove();
    };
  }, [authReady, setPendingInviteCode, logout]);

  if (!authReady) {
    return <View style={styles.loading}><ActivityIndicator color="#005B7F" /></View>;
  }
  return isAuthenticated ? <AppStack /> : <AuthStack />;
};

const styles = StyleSheet.create({
  loading: { alignItems: 'center', backgroundColor: '#F6F9F9', flex: 1, justifyContent: 'center' },
});