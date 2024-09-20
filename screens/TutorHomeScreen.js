/**
 * TutorHomeScreen 
 *
 * This screen serves as the home screen for tutors, displaying their 
 * information and providing navigation to various functionalities such as 
 * viewing sessions, managing requests, chatting, and accessing help.
 */

import React, { useLayoutEffect } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../screens/UserProvider'; // Import the user context

const TutorHomeScreen = ({ navigation }) => {
  const { user, loading } = useUser(); // Get user data and loading state from context

  // Check if loading
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  // Check if user is null
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not logged in</Text>
      </View>
    );
  }

  // Function to handle logout
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: () => {
            navigation.navigate('Login'); // Navigate to Login screen
          }
        }
      ]
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#87CEEB', 
        shadowColor: 'transparent', 
        elevation: 0, 
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#fff', 
        fontFamily: 'Avenir', 
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings', { user })}
          style={{ marginLeft: 15 }}
        >
          <Text style={{ fontSize: 16, color: '#fff' }}>Settings</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={{ marginRight: 15 }}
        >
          <Text style={{ fontSize: 16, color: '#fff' }}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, user]);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}!</Text>
      <Text style={styles.subTitle}>Your role: Tutor</Text>

      {/* My Sessions */}
      <TouchableOpacity onPress={() => navigation.navigate('SessionStatus')}>
        <Image source={require('../assets/sessions.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SessionStatus')}>
        <Text style={styles.buttonText}>My Sessions</Text>
      </TouchableOpacity>

      {/* Requests */}
      <TouchableOpacity onPress={() => navigation.navigate('SessionRequests')}>
        <Image source={require('../assets/requests.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SessionRequests')}>
        <Text style={styles.buttonText}>Requests</Text>
      </TouchableOpacity>

      {/* Chats */}
      <TouchableOpacity onPress={() => navigation.navigate('AllChats')}>
        <Image source={require('../assets/chats.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AllChats')}>
        <Text style={styles.buttonText}>Chats</Text>
      </TouchableOpacity>

      {/* Help Button */}
      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => navigation.navigate('Help', { user })}
      >
        <Text style={styles.helpButtonText}>Help</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for TutorHome
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f0f4f8', 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Avenir', 
  },
  subTitle: {
    fontSize: 20,
    color: '#555',
    marginBottom: 20, 
  },
  button: {
    backgroundColor: '#ADD8E6', 
    padding: 15,
    borderRadius: 10,
    marginVertical: 10, 
    width: '73%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3, 
    marginTop: -15,
    marginBottom: 26,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpButton: {
    position: 'absolute',
    bottom: 20, 
    backgroundColor: '#90EE90', 
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  helpButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  icon: {
    width: 250,
    height: 100,
    marginBottom: 15, 
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
  errorText: {
    fontSize: 18,
    color: '#d9534f', 
  },
});

export default TutorHomeScreen;
