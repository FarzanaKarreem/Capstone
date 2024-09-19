import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import { useUser } from '../screens/UserProvider';

const AllStudentChatsScreen = ({ navigation }) => {
  const { user } = useUser(); // Get user data from context
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch sessions where the current user is the student and the status is 'accepted'
    const q = query(
      collection(firestore, 'sessions'),
      where('studentId', '==', user.studentNum),
      where('status', '==', 'accepted')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedSessions = [];
      querySnapshot.forEach((doc) => {
        fetchedSessions.push({ id: doc.id, ...doc.data() });
      });
      setSessions(fetchedSessions);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sessions: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleChatPress = (session) => {
    navigation.navigate('Chat', {
      request: session,
      tutorId: session.tutorId,
      studentId: user.studentNum,
    });
  };

  const renderSessionItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
      <View style={styles.chatSummary}>
        <Text style={styles.tutorName}>Tutor: {item.tutorId}</Text>
        <Text>Module: {item.module}</Text>
        <Text>Time: {item.timeSlot}</Text>
        <Text>Additional Info: {item.additionalDetails}</Text>
      </View>
    </TouchableOpacity>
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
      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  chatSummary: {
    flexDirection: 'column',
  },
  tutorName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AllStudentChatsScreen;
