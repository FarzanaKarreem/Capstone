import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, firestore } from '../firebase/firebaseConfig'; // Ensure proper imports

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

  const handleSubmit = async () => {
    if (!name || !surname || !studentNum || !email || !degree || !yearOfStudy || !bio || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

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
  },
  inputText: {
    color: '#000',
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
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    color: '#fff',
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#0056b3',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 18,
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
  },
});

export default StudentRegistrationScreen;
