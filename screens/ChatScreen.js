import { arrayUnion, doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import { useUser } from '../screens/UserProvider';

const Chat = ({ route }) => {
  const { request, tutorId, studentId } = route.params;
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionDetails, setSessionDetails] = useState(null);

  useEffect(() => {
    if (!request) {
      Alert.alert("Error", "No chat request data provided.");
      return;
    }

    const chatId = `${tutorId}_${studentId}`;
    const chatDocRef = doc(firestore, 'chats', chatId);

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
    <View style={styles.container}>
      <View style={styles.sessionDetails}>
        <Text>Module: {sessionDetails?.module}</Text>
        <Text>Time Slot: {sessionDetails?.timeSlot}</Text>
        <Text>Additional Details: {sessionDetails?.additionalDetails}</Text>
      </View>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.createdAt.toDate().toString()}
        inverted // Invert the list to show the latest messages at the bottom
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionDetails: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
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
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#b0e0e6', // Light blue for user messages
  },
  tutorMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e1e1e1', // Light grey for tutor messages
  },
  messageText: {
    color: '#000', // Black text color
  },
  senderName: {
    fontWeight: 'bold',
    color: '#333', // Dark grey for sender name
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});

export default Chat;
