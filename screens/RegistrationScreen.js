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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  optionContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#6200ee',
    fontWeight: '500',
  },
});

export default RegistrationScreen;
