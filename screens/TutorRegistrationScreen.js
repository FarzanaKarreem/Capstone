/**
 * TutorRegistrationScreen 
 * 
 * This screen provides a registration form for tutors to create an account.
 * 
 * Features:
 * - Input fields for personal information (name, surname, student number, email, degree, year of study, bio, password).
 * - Option to upload a transcript using Document Picker.
 * - Modal for accepting Terms and Conditions before registration.
 * - Integration with Firebase Authentication for user registration.
 * - Storing additional user information in Firestore under the 'users' collection.
 */

import * as DocumentPicker from 'expo-document-picker';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, firestore } from '../firebase/firebaseConfig';

const TutorRegistrationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [studentNum, setStudentNum] = useState('');
  const [email, setEmail] = useState('');
  const [degree, setDegree] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [transcript, setTranscript] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false); // New state for T&Cs modal

  const handleUploadTranscript = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: false,
      });

      console.log('DocumentPicker result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setTranscript(asset.uri);
        setIsVerified(true);
        console.log('Transcript set successfully:', asset.uri);
        Alert.alert('Success', `Transcript uploaded successfully: ${asset.name}`);
      } else if (result.canceled) {
        console.log('User cancelled document picker');
        // Don't show an alert for cancellation
      } else {
        console.log('Unexpected result structure:', JSON.stringify(result, null, 2));
        Alert.alert('Error', 'An unexpected error occurred while picking the document');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', `An error occurred while picking the document: ${error.message}`);
    }
  };

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
      // Register tutor with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Send email verification
      await sendEmailVerification(user);
      Alert.alert('Success', 'A verification email has been sent to your email address. Please verify before logging in.');
  
      // Store additional tutor data in Firestore, including role
      await setDoc(doc(firestore, 'users', user.uid), {
        name,
        surname,
        studentNum,
        email,
        degree,
        yearOfStudy,
        bio,
        transcript,
        isVerified,
        role: 'tutor',  // Assign tutor role
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
      <Text style={styles.title}>Tutor Registration</Text>
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
        <Text>{yearOfStudy || 'Year of Study (Honours/Masters)'}</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleUploadTranscript}>
        <Text style={styles.buttonText}>Upload Transcript (Optional)</Text>
      </TouchableOpacity>
      <View style={styles.transcriptContainer}>
        {transcript && <Text style={styles.image}>Transcript Uploaded</Text>}
        {isVerified && <Text style={styles.verified}>Verified</Text>}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      {/* Modal for selecting Year of Study */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Select Year of Study</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setYearOfStudy('Honours');
                setModalVisible(!modalVisible);
              }}
            >
              <Text style={styles.modalButtonText}>Honours</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setYearOfStudy('Masters');
                setModalVisible(!modalVisible);
              }}
            >
              <Text style={styles.modalButtonText}>Masters</Text>
            </TouchableOpacity>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal for Terms and Conditions */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={termsVisible}
        onRequestClose={() => setTermsVisible(!termsVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Terms and Conditions</Text>
            <View style={styles.termsContainer}>
              <Text style={styles.modalText}>
                By registering, you agree to our Terms and Conditions.
                {'\n\n'}
                1. There will be no tolerance of disrespect.{'\n'}
                2. You must show up for your scheduled meeting - be respectful to your student.{'\n'}
                3. You must review your student after the session.{'\n'}
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
  image: {
    marginTop: 10,
    fontFamily: 'Avenir', 
    color: '#333', 
  },
  verified: {
    color: 'green',
    marginTop: 10,
    fontSize: 18,
    fontFamily: 'Avenir', 
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Avenir', 
    color: '#333', 
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#ADD8E8', 
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Avenir', 
  },
  modalCloseButton: {
    marginTop: 15,
  },
  modalCloseButtonText: {
    color: '#ADD8E8', 
    fontSize: 16,
    fontFamily: 'Avenir', 
  },
  transcriptContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  termsContainer: {
    padding: 10,
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Avenir', 
    color: '#333', 
  },
  modalButtons: {
    flexDirection: 'column',
    marginTop: 15,
    width: '100%',
    justifyContent: 'space-between',
  },
});

export default TutorRegistrationScreen;

