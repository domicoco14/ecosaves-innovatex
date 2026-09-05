import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabs } from './MainTabs';
import { GroupDetailScreen } from '../screens/app/GroupDetailScreen';
import { ContributionHistoryScreen } from '../screens/app/ContributionHistoryScreen';
import { CreateGroupStack } from './CreateGroupStack';

const Stack = createStackNavigator();

export const AppStack = () => {
  return (
    <Stack.Navigator
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
        name="ContributionHistory"
        component={ContributionHistoryScreen}
        options={{ title: 'Contribution History' }}
      />
      <Stack.Screen
        name="CreateGroupStack"
        component={CreateGroupStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
