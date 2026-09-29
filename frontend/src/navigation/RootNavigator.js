import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const lockSession = useAuthStore((state) => state.lockSession);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // Auto-lock session when app is minimized, backgrounded, or screen is locked
      if (appState.current === 'active' && nextAppState === 'background') {
        lockSession();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [lockSession]);

  return isAuthenticated ? <AppStack /> : <AuthStack />;
};
