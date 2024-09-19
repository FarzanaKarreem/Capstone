import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    if (!user) return;

    const q = query(
      collection(firestore, 'sessions'),
      where('tutorId', '==', user.studentNum) // Change to filter by tutorId
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
  
          // Ensure ratings array exists
          if (!studentData.ratings) {
            console.log('Initializing ratings array');
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
  
          Alert.alert('Success', 'Your rating has been successfully submitted!', [
            { text: 'OK', onPress: () => {
                setRatingModalVisible(false);
                setRating(0);
              }
            },
          ]);
        } else {
          console.error("No student document found for studentNum:", studentStudentNum);
          Alert.alert("Error", "The student for this session does not exist.");
        }
      } catch (error) {
        console.error("Error updating rating: ", error);
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

        {isCompleted && !item.studentRating && (
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
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Avenir',
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
  submitButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SessionStatusScreen;
