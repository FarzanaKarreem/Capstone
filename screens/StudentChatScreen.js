//bakcup screen in case chat screen didn't work for both tutor and student 
import React, { useEffect, useRef, useState } from 'react';
import { Button, FlatList, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

const StudentChatScreen = ({ route, navigation }) => {
  const { request } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSend = () => {
    if (message.trim()) {
      setMessages([...messages, { id: Date.now().toString(), text: message, sender: 'Student' }]);
      setMessage('');
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === 'Student' ? styles.studentMessageContainer : styles.tutorMessageContainer]}>
      <Text style={styles.senderName}>{item.sender}:</Text>
      <View style={[styles.message, item.sender === 'Student' ? styles.studentMessage : styles.tutorMessage]}>
        <Text>{item.text}</Text>
      </View>
    </View>
  );

  
  useEffect(() => {
    if (request.lastMessage) {
      setMessages([{ id: 'lastMessage', text: request.lastMessage, sender: 'Tutor' }]);
    }
  }, [request.lastMessage]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} 
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <View style={styles.requestDetails}>
            <Text style={styles.title}>Request Details</Text>
            <Text>Tutor: {request.tutorName}</Text>
            <Text>Module: {request.module}</Text>
            <Text>Date: {request.date}</Text>
            <Text>Time: {request.time}</Text>
            <Text>Additional Info: {request.additionalInfo}</Text>
          </View>

          <FlatList
            style={styles.messagesContainer}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            ref={flatListRef}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.inputContainer, keyboardVisible && styles.inputContainerWithKeyboard]}>
            <TextInput
              style={styles.input}
              placeholder="Type a message"
              value={message}
              onChangeText={setMessage}
            />
            <Button title="Send" onPress={handleSend} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  requestDetails: {
    padding: 10,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  senderName: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  message: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  tutorMessage: {
    backgroundColor: '#d1f7c4',
    alignSelf: 'flex-start',
  },
  studentMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  inputContainerWithKeyboard: {
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
});

export default StudentChatScreen;
