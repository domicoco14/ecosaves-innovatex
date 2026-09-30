import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { CreatePasswordScreen } from '../screens/auth/CreatePasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { JoinCircleScreen } from '../screens/app/JoinCircleScreen';
import { useAuthStore } from '../store/authStore';

const Stack = createStackNavigator();

export const AuthStack = () => {
  const pendingInviteCode = useAuthStore((state) => state.pendingInviteCode);

  return (
    <Stack.Navigator
      initialRouteName={pendingInviteCode ? 'JoinCircle' : 'Onboarding'}
      screenOptions={{
        headerStyle: { backgroundColor: '#F6F9F9', elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: '700', color: '#161C20' },
        headerTintColor: '#00597C',
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{ title: 'Sign Up' }}
      />
      <Stack.Screen
        name="VerifyEmail"
        component={VerifyEmailScreen}
        options={{ title: 'Verify Email' }}
      />
      <Stack.Screen
        name="CreatePassword"
        component={CreatePasswordScreen}
        options={{ title: 'Create Security PIN' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
      <Stack.Screen
        name="JoinCircle"
        component={JoinCircleScreen}
        options={{ title: 'Join a Circle' }}
        initialParams={pendingInviteCode ? { inviteCode: pendingInviteCode } : undefined}
      />
    </Stack.Navigator>
  );
};
