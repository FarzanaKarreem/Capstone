/**
 * StudentRegistrationScreen 
 *
 * This screen handles the registration process for students in the app.
 * It collects user information such as name, surname, student number, email,
 * degree, year of study, bio, and password. The registration process involves:
 *
 * 1. Validating that all required fields are filled out.
 * 2. Displaying a Terms and Conditions modal for user acceptance before 
 *    completing the registration.
 * 3. Creating a new user account with Firebase Authentication and sending a
 *    verification email.
 * 4. Storing additional user information in Firestore under the 'users' 
 *    collection, designating the user as a 'student'.
 * 5. Navigating to the Login screen upon successful registration.
 */

import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, firestore } from '../firebase/firebaseConfig';

const StudentRegistrationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [studentNum, setStudentNum] = useState('');
  const [email, setEmail] = useState('');
  const [degree, setDegree] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [termsVisible, setTermsVisible] = useState(false); // New state for T&Cs modal

  const handleSubmit = async () => {
    if (!name || !surname || !studentNum || !email || !degree || !yearOfStudy || !bio || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Show the T&Cs 
    setTermsVisible(true);
  };

  const handleTermsAccept = async () => {
    setTermsVisible(false); // Hide T&Cs 

    try {
      // Register student with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      Alert.alert('Success', 'A verification email has been sent to your email address. Please verify before logging in.');

      // Store additional student data in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        name,
        surname,
        studentNum,
        email,
        degree,
        yearOfStudy,
        bio,
        role: 'student', // Assign role as student
      });

      // Redirect to LoginScreen
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  const handleTermsDecline = () => {
    setTermsVisible(false); // Hide T&Cs modal, do nothing else
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Registration</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Surname"
        value={surname}
        onChangeText={setSurname}
      />
      <TextInput
        style={styles.input}
        placeholder="Student Number"
        value={studentNum}
        onChangeText={setStudentNum}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Degree"
        value={degree}
        onChangeText={setDegree}
      />
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.input}>
        <Text style={styles.inputText}>{yearOfStudy || 'Select Year of Study'}</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      {/* Modal for selecting year of study */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select Year of Study</Text>
          {['1st Year', '2nd Year', '3rd Year', '4th Year'].map((year) => (
            <Pressable
              key={year}
              style={[styles.modalButton, selectedYear === year && styles.selectedButton]}
              onPress={() => {
                setYearOfStudy(year);
                setSelectedYear(year);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>{year}</Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>Close</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Modal for Terms and Conditions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={termsVisible}
        onRequestClose={() => setTermsVisible(!termsVisible)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Terms and Conditions</Text>
          <View style={styles.termsContainer}>
            <Text style={styles.modalText}>
              By registering, you agree to our Terms and Conditions.
              {'\n\n'}
              1. There will be no tolerance of disrespect.{'\n'}
              2. You must show up for your scheduled meeting - be respectful to your tutor.{'\n'}
              3. You must review your tutor after the session.{'\n'}
              4. Ensure you comply with payment plans.
            </Text>
          </View>
          <View style={styles.modalButtons}>
            <Pressable
              style={styles.modalButton}
              onPress={handleTermsAccept}
            >
              <Text style={styles.modalButtonText}>Accept</Text>
            </Pressable>
            <Pressable
              style={styles.modalButton}
              onPress={handleTermsDecline}
            >
              <Text style={styles.modalButtonText}>Decline</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5', 
  },
  title: {
    fontSize: 24,
    fontFamily: 'Avenir', 
    color: '#333', 
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd', 
    marginBottom: 15,
    padding: 8,
    fontSize: 16,
    fontFamily: 'Avenir', 
    color: '#333', 
  },
  inputText: {
    color: '#333', 
  },
  button: {
    backgroundColor: '#ADD8E8', 
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff', 
    fontSize: 18,
    fontFamily: 'Avenir', 
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', 
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Arial', 
    color: '#fff', 
    marginBottom: 20,
  },
  termsContainer: {
    backgroundColor: '#fff', 
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '60%',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Avenir', 
    color: '#333', 
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#007bff', 
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff', 
    fontSize: 18,
    fontFamily: 'Arial', 
  },
  selectedButton: {
    backgroundColor: '#0056b3', 
  },
  modalCloseButton: {
    backgroundColor: '#ff4d4d', 
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  modalCloseText: {
    color: '#fff', 
    fontSize: 18,
    fontFamily: 'Avenir', 
  }
});

export default StudentRegistrationScreen;
