/*TutorHomeScreen 
 displays a welcome message and options for tutors, including navigation to search for tutors, view sessions, and access chats. 
 It checks user loading state and handles logout confirmation.*/
import React, { useLayoutEffect } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUser } from '../screens/UserProvider';

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
      <Text style={styles.subTitle}>Your role: {user.role}</Text>

      {/* image for serach */}
      <TouchableOpacity onPress={() => navigation.navigate('Search', { user})}>
      <Image source={require('../assets/requests.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Search', { user })}>
        <Text style={styles.buttonText}>Search for Tutors</Text>
      </TouchableOpacity>

      {/* image for sessions*/}
      <TouchableOpacity onPress={() => navigation.navigate('StudentSessionStatus', { user })}>
      <Image source={require('../assets/sessions.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StudentSessionStatus', { user })}>
        <Text style={styles.buttonText}>My Sessions</Text>
      </TouchableOpacity>

      {/* image added chats */}
      <TouchableOpacity onPress={() => navigation.navigate('AllStudentChats', { user })}>
      <Image source={require('../assets/chats.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AllStudentChats', { user })}>
        <Text style={styles.buttonText}>My Chats</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => navigation.navigate('Help', { user })}
      >
        <Text style={styles.helpButtonText}>Help</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the HomeScreen
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
    width: '72%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3, 
    marginTop: -15,
    marginBottom: 34,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpButton: {
    position: 'absolute',
    bottom: 30, 
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
