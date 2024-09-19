import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

// Import all your screens
import AllChatsScreen from './screens/AllChatsScreen';
import AllStudentChatsScreen from './screens/AllStudentChatsScreen';
import ChatScreen from './screens/ChatScreen';
import HelpScreen from './screens/HelpScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import PaymentScreen from './screens/PaymentScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import RequestScreen from './screens/RequestScreen';
import ReviewScreen from './screens/ReviewScreen';
import SearchScreen from './screens/SearchScreen';
import SessionRequestsScreen from './screens/SessionRequestsScreen';
import SessionStatusScreen from './screens/SessionStatusScreen';
import SettingsScreen from './screens/SettingsScreen';
import StudentChatScreen from './screens/StudentChatScreen';
import StudentRegistrationScreen from './screens/StudentRegistrationScreen';
import StudentSessionStatusScreen from './screens/StudentSessionStatusScreen';
import TutorDetailScreen from './screens/TutorDetailScreen';
import TutorHomeScreen from './screens/TutorHomeScreen';
import TutorListScreen from './screens/TutorListScreen';
import TutorRegistrationScreen from './screens/TutorRegistrationScreen';
import { UserProvider } from './screens/UserProvider';

// Create a stack navigator
const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} 
          
        />
        <Stack.Screen name="TutorHome" component={TutorHomeScreen} 
          
        />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="TutorList" component={TutorListScreen} />
        <Stack.Screen name="TutorDetail" component={TutorDetailScreen} />
        <Stack.Screen name="Request" component={RequestScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="SessionStatus" component={SessionStatusScreen} />
        <Stack.Screen name="StudentSessionStatus" component={StudentSessionStatusScreen} />
        <Stack.Screen name="SessionRequests" component={SessionRequestsScreen} />
        <Stack.Screen name="AllChats" component={AllChatsScreen} />
        <Stack.Screen name="StudentChat" component={StudentChatScreen} />
        <Stack.Screen name="AllStudentChats" component={AllStudentChatsScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
        <Stack.Screen name="StudentRegistration" component={StudentRegistrationScreen} />
        <Stack.Screen name="TutorRegistration" component={TutorRegistrationScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
}
