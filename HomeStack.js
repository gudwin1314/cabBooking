import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CabsListScreen from './CabsListScreen'; 
import CabDetailScreen from './CabDetailScreen'; 

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196f3', 
        },
        headerTintColor: '#fff', 
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="Cabs List" component={CabsListScreen} options={{ title: 'Available Cabs' }} />
      <Stack.Screen name="Cab Detail" component={CabDetailScreen} options={{ title: 'Cab Details' }} />
    </Stack.Navigator>
  );
}
