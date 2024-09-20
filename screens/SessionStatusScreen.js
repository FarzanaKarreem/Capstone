import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import { useUser } from './UserProvider';

const SessionStatusScreen = ({ navigation }) => {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestore, 'sessions'),
      where('tutorId', '==', user.studentNum)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedSessions = [];
      querySnapshot.forEach((doc) => {
        const sessionData = doc.data();
        const sessionDate = new Date(sessionData.sessionDate.toDate ? sessionData.sessionDate.toDate() : sessionData.sessionDate);
        const now = new Date();

        // Filter out sessions based on status and date
        if (sessionData.status !== 'paid' && !(sessionData.status === 'pending' && sessionDate > now)) {
          fetchedSessions.push({ id: doc.id, ...sessionData });
        }
      });

      // Sort sessions: first by whether they are eligible for rating, then by date (most recent first)
      const sortedSessions = fetchedSessions.sort((a, b) => {
        const now = new Date();
        const aDate = a.sessionDate.toDate ? a.sessionDate.toDate() : a.sessionDate;
        const bDate = b.sessionDate.toDate ? b.sessionDate.toDate() : b.sessionDate;

        // Check if sessions are eligible for rating
        const aEligible = (aDate < now && !a.studentRating) || a.status === 'accepted';
        const bEligible = (bDate < now && !b.studentRating) || b.status === 'accepted';

        // Sort eligible ratings first, then by date
        if (aEligible && !bEligible) return -1;
        if (!aEligible && bEligible) return 1;
        return bDate - aDate; // Most recent first
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
      try {
        const sessionRef = doc(firestore, 'sessions', currentSessionId);
        const sessionDoc = await getDoc(sessionRef);
        if (!sessionDoc.exists()) {
          Alert.alert("Error", "Session document not found.");
          return;
        }

        const sessionData = sessionDoc.data();
        const studentStudentNum = sessionData.studentId;

        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('studentNum', '==', studentStudentNum));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0];
          const studentData = studentDoc.data();

          if (!studentData.ratings) {
            await updateDoc(studentDoc.ref, { ratings: [] });
          }

          await updateDoc(studentDoc.ref, {
            ratings: arrayUnion(rating),
          });

          const updatedStudentDoc = await getDoc(studentDoc.ref);
          const updatedStudentData = updatedStudentDoc.data();
          const updatedRatings = updatedStudentData.ratings || [];
          const newAverageRating = updatedRatings.reduce((a, b) => a + b, 0) / updatedRatings.length;

          await updateDoc(studentDoc.ref, {
            averageRating: newAverageRating,
          });

          await updateDoc(sessionRef, { tutorRating: rating });

          // Remove session from displayed list after rating
          setSessions(prevSessions => prevSessions.filter(session => session.id !== currentSessionId));

          Alert.alert('Success', 'Your rating has been successfully submitted!', [
            { 
              text: 'OK', 
              onPress: () => {
                setRatingModalVisible(false);
                setRating(0);
                navigation.navigate('Payment', { sessionId: currentSessionId });
              }
            },
          ]);
        } else {
          Alert.alert("Error", "The student for this session does not exist.");
        }
      } catch (error) {
        Alert.alert("Error", "There was an issue submitting your rating. Please try again.");
      }
    } else {
      Alert.alert("Error", "Please select a rating before submitting.");
    }
  };

  const renderItem = (item) => {
    const now = new Date();
    const sessionDate = new Date(item.sessionDate.toDate ? item.sessionDate.toDate() : item.sessionDate);
    const isCompleted = sessionDate < now;

    return (
      <View key={item.id} style={styles.card}>
        <Text style={styles.studentText}>Student: {item.studentId}</Text>
        <Text style={styles.cardContent}>Date: {sessionDate.toDateString()}</Text>
        <Text style={styles.cardContent}>Time: {item.timeSlot}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>

        {(item.status === 'accepted' || isCompleted) && !item.studentRating && (
          <TouchableOpacity
            style={styles.rateButton}
            onPress={() => {
              setCurrentSessionId(item.id);
              setRatingModalVisible(true);
            }}
          >
            <Text style={styles.rateButtonText}>Rate this session</Text>
          </TouchableOpacity>
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
            <TouchableOpacity style={styles.submitButton} onPress={handleRatingSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
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
    backgroundColor: '#f4f4f9',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'Avenir',
  },
  card: {
    padding: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  studentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Avenir',
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Avenir',
  },
  status: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Avenir',
  },
  rateButton: {
    backgroundColor: '#aaf0c9',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  rateButtonText: {
    fontSize: 16,
    color: '#000',
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
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  star: {
    fontSize: 30,
    margin: 5,
    color: '#f5c518',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default SessionStatusScreen;
