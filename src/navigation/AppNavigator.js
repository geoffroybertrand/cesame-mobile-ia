/**
 * Navigation principale de l'application
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import WorkspacesScreen from '../screens/WorkspacesScreen';
import ChatScreen from '../screens/ChatScreen';
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FAF6F1' },
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="Workspaces" component={WorkspacesScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
