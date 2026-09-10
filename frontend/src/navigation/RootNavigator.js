import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const lockSession = useAuthStore((state) => state.lockSession);

  useEffect(() => {
    // Keep user session active during navigation and native dialog triggers
  }, []);

  return isAuthenticated ? <AppStack /> : <AuthStack />;
};
