import * as DocumentPicker from 'expo-document-picker';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, firestore } from '../firebase/firebaseConfig'; // Ensure proper imports

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
      {transcript && <Text style={styles.image}>Transcript Uploaded</Text>}
      {isVerified && <Text style={styles.verified}>Verified</Text>}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 8,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  verified: {
    color: 'green',
    marginTop: 10,
    fontSize: 18,
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
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalCloseButton: {
    marginTop: 15,
  },
  modalCloseButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
});

export default TutorRegistrationScreen;