import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabs } from './MainTabs';
import { GroupDetailScreen } from '../screens/app/GroupDetailScreen';
import { GroupChatScreen } from '../screens/app/GroupChatScreen';
import { ContributionHistoryScreen } from '../screens/app/ContributionHistoryScreen';
import { JoinCircleScreen } from '../screens/app/JoinCircleScreen';
import { CreateGroupStack } from './CreateGroupStack';
import { useAuthStore } from '../store/authStore';

const Stack = createStackNavigator();

export const AppStack = () => {
  const pendingInviteCode = useAuthStore((state) => state.pendingInviteCode);

  return (
    <Stack.Navigator
      initialRouteName={pendingInviteCode ? 'JoinCircle' : 'MainTabs'}
      screenOptions={{
        headerStyle: { backgroundColor: '#F6F9F9', elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: '700', color: '#161C20' },
        headerTintColor: '#00597C',
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{ title: 'Group Details' }}
      />
      <Stack.Screen
        name="GroupChat"
        component={GroupChatScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ContributionHistory"
        component={ContributionHistoryScreen}
        options={{ title: 'Savings Activity' }}
      />
      <Stack.Screen
        name="CreateGroupStack"
        component={CreateGroupStack}
        options={{ headerShown: false }}
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
