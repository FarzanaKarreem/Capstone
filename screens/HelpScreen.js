import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useUser } from './UserProvider'; // Import the user context

const HelpScreen = () => {
  const { user } = useUser();
  const [message, setMessage] = useState('');

  const handleSendEmail = () => {
    // Implement email sending functionality here
    // For example, using an email API or service
    Alert.alert("Email Sent", "Your message has been sent successfully.");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Help</Text>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={user?.name || ''}
        editable={false}
      />
      <Text style={styles.label}>Student Number:</Text>
      <TextInput
        style={styles.input}
        value={user?.studentNum || ''}
        editable={false}
      />
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={user?.email || ''}
        editable={false}
      />
      <Text style={styles.label}>Message:</Text>
      <TextInput
        style={styles.messageInput}
        multiline
        value={message}
        onChangeText={setMessage}
        placeholder="Enter your message here..."
        textAlignVertical="top" // Ensures text starts at the top of the input box
      />
      <TouchableOpacity style={styles.button} onPress={handleSendEmail}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff', // Ensure background color to improve text visibility
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    height: 150,
    marginBottom: 15,
    backgroundColor: '#fff', // Ensure background color to improve text visibility
    textAlignVertical: 'top', // Ensures text starts at the top of the input box
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default HelpScreen;
