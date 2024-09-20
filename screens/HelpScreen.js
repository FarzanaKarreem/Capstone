/* HelpScreen 
It allows users to submit queries, with options to select query types and enter a message. 
 It integrates Firestore to store help requests and uses a modal for selecting query types.
 */

import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { firestore } from "../firebase/firebaseConfig";
import { useUser } from './UserProvider';

const HelpScreen = () => {
  const { user } = useUser();
  // Manages the input state for the help message
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // Tracks the visibility state 
  const [selectedQuery, setSelectedQuery] = useState('Select Query Type'); // Tracks the selected query type .


  const queryOptions = [
    'Incident with another user',
    'App Issue',
    'Session Booking Issue',
    'Other',
  ];

  // Sends the user's help request to Firestore
  const handleSendQuery = async () => {
    if (selectedQuery === 'Select Query Type' || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'helpRequests'), {
        email: user?.email,
        message,
        name: user?.name,
        queryType: selectedQuery,
        studentNum: user?.studentNum,
      });
      Alert.alert('Query Sent', 'Your query has been sent successfully.');
      // Clear the form or navigate to another screen if needed
    } catch (error) {
      Alert.alert('Error', `Failed to send query: ${error.message}`);
    }
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Handles the selection of a query type 
  const handleSelectQuery = (query) => {
    setSelectedQuery(query);
    closeModal();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Help</Text>
      <Text style={styles.label}>Name:</Text>
      <TextInput style={styles.input} value={user?.name || ''} editable={false} />
      <Text style={styles.label}>Student Number:</Text>
      <TextInput style={styles.input} value={user?.studentNum || ''} editable={false} />
      <Text style={styles.label}>Email:</Text>
      <TextInput style={styles.input} value={user?.email || ''} editable={false} />
      
      <Text style={styles.label}>Query Type:</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={openModal}>
        <Text style={styles.pickerButtonText}>{selectedQuery}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Message:</Text>
      <TextInput
        style={styles.messageInput}
        multiline
        value={message}
        onChangeText={setMessage}
        placeholder="Enter your message here..."
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.button} onPress={handleSendQuery}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>

      {/* Modal picker */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {queryOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalOption}
                onPress={() => handleSelectQuery(option)}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={closeModal} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
//Styles for help screen 
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#e8f0f2', 
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333', 
    marginBottom: 20,
    fontFamily: 'Avenir', 
  },
  label: {
    fontSize: 18,
    marginVertical: 5,
    color: '#555', 
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontFamily: 'Avenir', 
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    height: 150,
    marginBottom: 15,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    fontFamily: 'Avenir', 
  },
  button: {
    backgroundColor: '#007bff', 
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalOption: {
    paddingVertical: 15,
  },
  modalOptionText: {
    fontSize: 18,
    color: '#007bff',
  },
  modalCancel: {
    paddingVertical: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 18,
    color: '#d9534f',
  },
});

export default HelpScreen;
