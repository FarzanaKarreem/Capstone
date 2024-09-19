import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const RegistrationScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register as</Text>

      <TouchableOpacity 
        style={styles.optionContainer} 
        onPress={() => navigation.navigate('StudentRegistration')}
      >
        <Image
          source={require('../assets/student.jpg')}
          style={styles.image}
        />
        <Text style={styles.buttonText}>Student</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionContainer} 
        onPress={() => navigation.navigate('TutorRegistration')}
      >
        <Image
          source={require('../assets/tutor.jpg')}
          style={styles.image}
        />
        <Text style={styles.buttonText}>Tutor</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#f0f4f8', // Match TutorHomeScreen background
  },
  title: {
    fontSize: 28, // Match TutorHomeScreen title size
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    fontFamily: 'Avenir', // Match TutorHomeScreen font
  },
  optionContainer: {
    alignItems: 'center',
    marginVertical: 15,
    backgroundColor: '#ADD8E6', // Light blue background color
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '80%', // Adjust width to fit the content
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3, // Add shadow for Android
    marginTop: 50,
    marginBottom:50,
  },
  image: {
    width: 250, // Match TutorHomeScreen icon width
    height: 100, // Match TutorHomeScreen icon height
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff', // White text color for contrast
    fontWeight: 'bold',
    fontFamily: 'Avenir', // Match TutorHomeScreen font
  },
});

export default RegistrationScreen;
