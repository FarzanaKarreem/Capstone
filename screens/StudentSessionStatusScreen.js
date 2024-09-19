import { arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import { useUser } from './UserProvider';

const StudentSessionStatusScreen = () => {
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
      where('studentId', '==', user.studentNum)
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
        // Get session details
        const sessionRef = doc(firestore, 'sessions', currentSessionId);
        const sessionDoc = await getDoc(sessionRef);
        const sessionData = sessionDoc.data();
  
        // Log the session data and tutorId for debugging
        console.log('Session Data:', sessionData);
  
        // Get tutor ID (which is the studentNum) from session details
        const tutorStudentNum = sessionData.tutorId;
        console.log('Tutor Student Number:', tutorStudentNum);  // Log the tutor's studentNum for debugging
  
        // Query the 'users' collection for the tutor using the studentNum
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('studentNum', '==', tutorStudentNum));
  
        // Execute the query
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          // Assume the first result is the correct tutor document
          const tutorDoc = querySnapshot.docs[0];
          const tutorData = tutorDoc.data();
          console.log('Tutor Data:', tutorData);  // Log tutor data for verification
  
          // Update the tutor's ratings array using arrayUnion
          await updateDoc(tutorDoc.ref, {
            ratings: arrayUnion(rating),  // Append the new rating
          });
  
          // Re-fetch the updated tutor document to calculate the new average rating
          const updatedTutorDoc = await getDoc(tutorDoc.ref);
          const updatedTutorData = updatedTutorDoc.data();
  
          // Calculate new average rating
          const updatedRatings = updatedTutorData.ratings || [];
          const newAverageRating = updatedRatings.reduce((a, b) => a + b, 0) / updatedRatings.length;
          
          // Log for debugging
          console.log('New Average Rating:', newAverageRating);
  
          // Update tutor document with new average rating
          await updateDoc(tutorDoc.ref, {
            averageRating: newAverageRating,
          });
        } else {
          console.error("Tutor document with studentNum does not exist! Tutor studentNum:", tutorStudentNum);
          Alert.alert("Error", "The tutor for this session does not exist. Please check the session data.");
          return;  // Exit early since the tutor document doesn't exist
        }
  
        // Update session document with student rating
        await updateDoc(sessionRef, { studentRating: rating });
  
        // Show success message after successful submission
        Alert.alert(
          'Success',
          'Your rating has been successfully submitted!',
          [
            {
              text: 'OK',
              onPress: () => {
                setRatingModalVisible(false); // Close the modal
                setRating(0); // Reset the rating
              },
            },
          ],
          { cancelable: false }
        );
      } catch (error) {
        console.error("Error updating rating: ", error);  // Log the error
        Alert.alert("Error", "There was an issue submitting your rating. Please try again.");
      }
    } else {
      // Show an alert if rating is not set
      Alert.alert("Error", "Please select a rating before submitting.");
    }
  };
  
  

  const renderItem = (item) => {
    const now = new Date();
    const sessionDate = new Date(item.sessionDate.toDate ? item.sessionDate.toDate() : item.sessionDate);
    const isCompleted = sessionDate < now;

    return (
      <View key={item.id} style={styles.card}>
        <Text>Tutor: {item.tutorId}</Text>
        <Text style={styles.cardContent}>Date: {sessionDate.toDateString()}</Text>
        <Text style={styles.cardContent}>Time: {item.timeSlot}</Text>
        <Text style={styles.status}>Status: {item.status}</Text>

        {isCompleted && !item.studentRating && (
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

export default StudentSessionStatusScreen;
