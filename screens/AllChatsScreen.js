import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import { useUser } from '../screens/UserProvider';

const AllChatsScreen = ({ navigation }) => {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestore, 'sessions'),
      where('tutorId', '==', user.studentNum),
      where('status', '==', 'accepted')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedSessions = [];
      for (const doc of querySnapshot.docs) {
        const sessionData = { id: doc.id, ...doc.data() };
        // Fetch user data for each session
        const userDoc = await getDocs(query(collection(firestore, 'users'), where('studentNum', '==', sessionData.studentId)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          sessionData.studentName = userData.name || 'Unknown';
          sessionData.studentImage = userData.image || null;
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
      tutorId: user.studentNum,
      studentId: session.studentId,
    });
  };

  const renderSessionItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
      <Image
        source={item.studentImage ? { uri: item.studentImage } : require('../assets/defaultProfilePic.png')}
        style={styles.avatar}
      />
      <View style={styles.chatSummary}>
        <Text style={styles.studentName}>{item.studentName}</Text>
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
    width: 70,  // Increased from 50 to 70
    height: 70, // Increased from 50 to 70
    borderRadius: 35, // Half of the width/height
    marginRight: 15,
  },
  chatSummary: {
    flex: 1,
    justifyContent: 'center', // Added to vertically center the text
  },
  studentName: {
    fontFamily: 'System',
    fontSize: 18, // Slightly increased from 16 to 18
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

export default AllChatsScreen;