import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CreateGroupStep1Screen } from '../screens/app/createGroup/CreateGroupStep1Screen';
import { CreateGroupStep2Screen } from '../screens/app/createGroup/CreateGroupStep2Screen';
import { CreateGroupStep3Screen } from '../screens/app/createGroup/CreateGroupStep3Screen';

const Stack = createStackNavigator();

export const CreateGroupStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#F6F9F9', elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: '700', color: '#161C20' },
        headerTintColor: '#00597C',
      }}
    >
      <Stack.Screen
        name="CreateGroupStep1"
        component={CreateGroupStep1Screen}
        options={{ title: 'Group Setup' }}
      />
      <Stack.Screen
        name="CreateGroupStep2"
        component={CreateGroupStep2Screen}
        options={{ title: 'Payout Schedule' }}
      />
      <Stack.Screen
        name="CreateGroupStep3"
        component={CreateGroupStep3Screen}
        options={{ title: 'Review Group' }}
      />
    </Stack.Navigator>
  );
};
