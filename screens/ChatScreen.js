/*
  Chat Screen
Allows real-time messaging between tutors and students for a session, where the messages are appended to the Firestore messages array
It integrates Firebase Firestore to create or access a unique chat document using the tutorId and studentId as the chat ID
onSnapshot to handle real-time updates

*/

import { arrayUnion, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import { useUser } from '../screens/UserProvider';

const Chat = ({ route }) => {
  const { request, tutorId, studentId } = route.params;
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState(null);

  // Fetches chat messages from Firestore or creates a new chat document if it doesn't exist.
  useEffect(() => {
    const chatId = `${tutorId}_${studentId}`;
    const chatDocRef = doc(firestore, 'chats', chatId);
// Retrieves or initializes chat messages and session details from Firestore.
    const fetchMessages = async () => {
      try {
        const chatDocSnap = await getDoc(chatDocRef);

        if (chatDocSnap.exists()) {
          const unsubscribe = onSnapshot(chatDocRef, (doc) => {
            const data = doc.data();
            const sortedMessages = (data?.messages || []).sort((a, b) => a.createdAt.toDate() - b.createdAt.toDate());
            setMessages(sortedMessages);
            setSessionDetails({
              module: data.module,
              timeSlot: data.timeSlot,
              additionalDetails: data.additionalDetails
            });
            setLoading(false);
          });
          return unsubscribe;
        } else {
          await setDoc(chatDocRef, {
            sessionId: request.id,
            tutorId: tutorId,
            studentId: studentId,
            messages: [],
            module: request.module,
            timeSlot: request.timeSlot,
            additionalDetails: request.additionalDetails
          });
          setSessionDetails({
            module: request.module,
            timeSlot: request.timeSlot,
            additionalDetails: request.additionalDetails
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching messages: ", error);
        Alert.alert("Error", "Failed to fetch messages.");
        setLoading(false);
      }
    };

    fetchMessages();
  }, [request, tutorId, studentId, user.studentNum]);
 // Sends a new message by updating the Firestore 'chats' document.
  const handleSendMessage = async () => {
    if (newMessage.trim() === '') {
      Alert.alert("Error", "Message cannot be empty.");
      return;
    }

    const chatId = `${tutorId}_${studentId}`;
    const chatDocRef = doc(firestore, 'chats', chatId);

    try {
      await updateDoc(chatDocRef, {
        messages: arrayUnion({
          text: newMessage,
          createdAt: new Date(),
          senderId: user.studentNum,
          receiverId: tutorId,
        })
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
      Alert.alert("Error", "Failed to send message.");
    }
  };
// Renders each chat message in the UI with sender/receiver identification and timestamp.
  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.senderId === user.studentNum ? styles.userMessage : styles.tutorMessage]}>
      <Text style={styles.senderName}>{item.senderId}</Text>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>{new Date(item.createdAt.toDate()).toLocaleTimeString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} 
    >
      <View style={styles.sessionDetails}>
        <Text style={styles.sessionDetailText}>Module: {sessionDetails?.module}</Text>
        <Text style={styles.sessionDetailText}>Time Slot: {sessionDetails?.timeSlot}</Text>
        <Text style={styles.sessionDetailText}>Additional Details: {sessionDetails?.additionalDetails}</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.createdAt.toDate().toString()}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};
//styles for chat screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f9', 
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionDetails: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#ffffff',
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sessionDetailText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Avenir',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
    fontFamily: 'Avenir',
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Avenir',
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#a3d9a5',
  },
  tutorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e1e1e1',
  },
  messageText: {
    color: '#000',
    fontFamily: 'Avenir',
  },
  senderName: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    fontFamily: 'Avenir',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    fontFamily: 'Avenir',
  },
});

export default Chat;
