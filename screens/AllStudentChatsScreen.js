import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import { useUser } from '../screens/UserProvider';

const AllStudentChatsScreen = ({ navigation }) => {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestore, 'sessions'),
      where('studentId', '==', user.studentNum),
      where('status', '==', 'accepted')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedSessions = [];
      for (const doc of querySnapshot.docs) {
        const sessionData = { id: doc.id, ...doc.data() };
        // Fetch tutor data for each session
        const tutorDoc = await getDocs(query(collection(firestore, 'users'), where('studentNum', '==', sessionData.tutorId)));
        if (!tutorDoc.empty) {
          const tutorData = tutorDoc.docs[0].data();
          sessionData.tutorName = tutorData.name || 'Unknown';
          sessionData.tutorImage = tutorData.image || null;
        }
        fetchedSessions.push(sessionData);
      }
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
      <Image
        source={item.tutorImage ? { uri: item.tutorImage } : require('../assets/defaultProfilePic.png')}
        style={styles.avatar}
      />
      <View style={styles.chatSummary}>
        <Text style={styles.tutorName}>{item.tutorName}</Text>
        <Text style={styles.moduleText}>{item.module}</Text>
        <Text style={styles.timeText}>{item.timeSlot}</Text>
        <Text style={styles.additionalInfo} numberOfLines={1}>{item.additionalDetails}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
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
    backgroundColor: '#F5F5F5',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  chatSummary: {
    flex: 1,
    justifyContent: 'center',
  },
  tutorName: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  moduleText: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#4A90E2',
    marginBottom: 2,
  },
  timeText: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  additionalInfo: {
    fontFamily: 'System',
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
});

export default AllStudentChatsScreen;