import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import { useUser } from './UserProvider'; // Assuming you're using a user context for student/tutor info

const SessionStatusScreen = () => {
  const { user } = useUser(); // Get user data from context
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!user || !user.studentNum) return;

    // Query to fetch sessions only for the specific tutor
    const q = query(collection(firestore, 'sessions'), where('tutorId', '==', user.studentNum));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedSessions = [];
      querySnapshot.forEach((doc) => {
        fetchedSessions.push({ id: doc.id, ...doc.data() });
      });

      // Sort sessions so that completed ones come last
      const sortedSessions = fetchedSessions.sort((a, b) => {
        const aDate = new Date(a.sessionDate.toDate ? a.sessionDate.toDate() : a.sessionDate);
        const bDate = new Date(b.sessionDate.toDate ? b.sessionDate.toDate() : b.sessionDate);
        const now = new Date();

        // Completed sessions should be at the bottom
        const aIsCompleted = aDate < now && (a.studentRating || a.tutorRating);
        const bIsCompleted = bDate < now && (b.studentRating || b.tutorRating);

        if (aIsCompleted && !bIsCompleted) return 1;
        if (!aIsCompleted && bIsCompleted) return -1;
        return aDate - bDate;
      });

      setSessions(sortedSessions);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching sessions: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleRatingSubmit = async () => {
    if (currentSessionId && rating > 0) {
      const sessionRef = doc(firestore, 'sessions', currentSessionId);
      await updateDoc(sessionRef, { tutorRating: rating, status: 'completed' }); // Save rating and set session to 'completed'
      setRatingModalVisible(false);
      setRating(0); // Reset the rating
      navigation.navigate('Payment')
    }
  };

  const renderItem = (item) => {
    const now = new Date();
    const sessionDate = new Date(item.sessionDate.toDate ? item.sessionDate.toDate() : item.sessionDate);
    const isCompleted = sessionDate < now;

    return (
      <View key={item.id} style={styles.card}>
        <Text>Student: {item.studentId}</Text>
        <Text style={styles.cardContent}>Date: {sessionDate.toDateString()}</Text>
        <Text style={styles.cardContent}>Time: {item.timeSlot}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>

        {/* Show rating button if the session is completed and the tutor hasn't rated yet */}
        {isCompleted && !item.tutorRating && (
          <Button
            title="Rate this session"
            onPress={() => {
              setCurrentSessionId(item.id);
              setRatingModalVisible(true);
            }}
          />
        )}

        {/* Show the student's rating if they've rated already */}
        {isCompleted && item.studentRating && (
          <Text>Student's Rating: {item.studentRating}</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Tutor Sessions</Text>
      <ScrollView>
        {sessions.length === 0 ? (
          <Text style={styles.noSessionsText}>No sessions found.</Text>
        ) : (
          sessions.map(renderItem)
        )}
      </ScrollView>

      <Modal
        visible={ratingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate this session</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Text style={styles.star}>{star <= rating ? '★' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Submit" onPress={handleRatingSubmit} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSessionsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  cardContent: {
    fontSize: 16,
    marginBottom: 5,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    fontSize: 30,
    margin: 5,
    color: '#FFD700',
  },
});

export default SessionStatusScreen;

 