import React, { useState, useEffect } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View, StyleSheet, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase/firebaseConfig';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(null);  // State for role (tutor/student)
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!role) {
      Alert.alert('Error', 'Please select a role before logging in.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the email is verified
      if (!user.emailVerified) {
        Alert.alert('Email Not Verified', 'You must verify your email address before logging in. Please check your inbox for the verification link.');
        return;
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        if (userData.role === role) {
          if (role === 'tutor') {
            navigation.navigate('TutorHome');
          } else if (role === 'student') {
            navigation.navigate('Home');
          }
        } else {
          const errorMessage = `You registered as a ${userData.role}. Please select the correct role.`;
          Alert.alert('Error', errorMessage);
        }
      } else {
        Alert.alert('Error', 'User role not found.');
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Image 
        source={require('../assets/uctlogo.png')}  // Path to the logo
        style={styles.logo}  // Add a style for the logo
      />
      <Text style={styles.title}>UCT Tutor Login</Text>
      <View style={styles.roleSelectionContainer}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'student' && styles.selectedRoleButton
          ]}
          onPress={() => setRole('student')}
        >
          <Text style={styles.roleButtonText}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'tutor' && styles.selectedRoleButton
          ]}
          onPress={() => setRole('tutor')}
        >
          <Text style={styles.roleButtonText}>Tutor</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.inputBorder]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[styles.input, styles.inputBorder]}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>Register</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  roleSelectionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  selectedRoleButton: {
    backgroundColor: '#0056b3',
  },
  roleButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    padding: 10,
    fontSize: 16,
    marginVertical: 5,
  },
  inputBorder: {
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  link: {
    marginTop: 10,
    color: '#007bff',
    fontSize: 16,
  },
});

export default LoginScreen;
