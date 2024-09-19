import { signOut } from 'firebase/auth'; // Import signOut function from Firebase
import React, { useLayoutEffect } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebase/firebaseConfig'; // Import auth instance
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
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigation.navigate('Login'); // Navigate to Login screen
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#87CEEB', // Add a background color
        shadowColor: 'transparent', // Remove the bottom shadow
        elevation: 0, // Remove shadow for Android
      },
      headerTitleStyle: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#fff', // Change the title color to white
        fontFamily: 'Avenir', // Use a custom font if available
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
  

  // Main content when the user is available
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}!</Text>
      <Text style={styles.subTitle}>Your role: {user.role}</Text>

      {/* Add an image above the search button */}
      <Image source={require('../assets/requests.png')} style={styles.icon} />
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Search', { user })}>
        <Text style={styles.buttonText}>Search for Tutors</Text>
      </TouchableOpacity>

      {/* Add an image above the sessions button */}
      <TouchableOpacity onPress={() => navigation.navigate('AllChats')}>
      <Image source={require('../assets/sessions.png')} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StudentSessionStatus', { user })}>
        <Text style={styles.buttonText}>My Sessions</Text>
      </TouchableOpacity>

      {/* Add an image above the chats button */}
      <TouchableOpacity onPress={() => navigation.navigate('AllChats')}>
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

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f0f4f8', // Light background color
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    fontFamily: 'Avenir', // Custom font
  },
  subTitle: {
    fontSize: 20,
    color: '#555',
    marginBottom: 20, // Reduce margin to move content up
  },
  button: {
    backgroundColor: '#ADD8E6', // Light blue button
    padding: 15,
    borderRadius: 10,
    marginVertical: 10, // Slight margin around the buttons
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3, // Add shadow for Android
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpButton: {
    position: 'absolute',
    bottom: 30, // Move the help button lower
    backgroundColor: '#90EE90', // Light green color
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
    marginBottom: 15, // Add space between image and button
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
  errorText: {
    fontSize: 18,
    color: '#d9534f', // Red for error messages
  },
});

export default TutorHomeScreen;
