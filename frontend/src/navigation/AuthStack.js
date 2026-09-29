import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { VerifyEmailScreen } from '../screens/auth/VerifyEmailScreen';
import { CreatePasswordScreen } from '../screens/auth/CreatePasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';

const Stack = createStackNavigator();

export const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
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
        options={{ title: 'Create Password' }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
    </Stack.Navigator>
  );
};
