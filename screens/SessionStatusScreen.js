import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import { useUser } from './UserProvider';

const SessionStatusScreen = () => {
  const { user } = useUser(); // Get user data from context
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!user || !user.studentNum) return;

    const q = query(collection(firestore, 'sessions'), where('tutorId', '==', user.studentNum));

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

  const handleRatingSubmit = async () => {
    if (currentSessionId && rating > 0) {
      const sessionRef = doc(firestore, 'sessions', currentSessionId);
      await updateDoc(sessionRef, { tutorRating: rating, status: 'completed' });

      // Get student ID from the current session
      const session = sessions.find(session => session.id === currentSessionId);
      if (session) {
        const studentId = session.studentId;
        const studentRef = doc(firestore, 'users', studentId);

        // Add rating to the student's ratings array
        await updateDoc(studentRef, {
          ratings: firebase.firestore.FieldValue.arrayUnion(rating)
        });

        // Update the student's average rating
        await updateAverageRating(studentRef, rating);
      }

      setRatingModalVisible(false);
      setRating(0); // Reset the rating
    }
  };

  const updateAverageRating = async (userRef, newRating) => {
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    const ratings = userData.ratings || [];

    // Calculate new average rating
    const newAverageRating = (ratings.reduce((a, b) => a + b, 0) + newRating) / (ratings.length + 1);

    await updateDoc(userRef, { averageRating: newAverageRating });
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

        {isCompleted && !item.tutorRating && (
          <Button
            title="Rate this session"
            onPress={() => {
              setCurrentSessionId(item.id);
              setRatingModalVisible(true);
            }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Sessions</Text>
      <ScrollView>
        {loading ? (
          <ActivityIndicator size="large" color="#007bff" />
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
  card: {
    padding: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
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
