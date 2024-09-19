// AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Import all your screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import TutorListScreen from '../screens/TutorListScreen';
import TutorDetailScreen from '../screens/TutorDetailScreen';
import StudentRequestScreen from '../screens/StudentRequestScreen';
import ChatScreen from '../screens/ChatScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ReviewScreen from '../screens/ReviewScreen';
import SessionStatusScreen from '../screens/SessionStatusScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Tutors" component={TutorListScreen} />
        <Stack.Screen name="TutorDetail" component={TutorDetailScreen} />
        <Stack.Screen name="Request" component={StudentRequestScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="SessionStatus" component={SessionStatusScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;