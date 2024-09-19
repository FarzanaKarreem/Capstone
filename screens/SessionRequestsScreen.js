import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig'; // Adjust the path as needed
import { useUser } from '../screens/UserProvider'; // Adjust the path as needed

const SessionRequests = ({ navigation }) => {
  const { user } = useUser(); // Get current user from context
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    const fetchRequestsAndRatings = async () => {
      setLoading(true);
      try {
        // Fetch session requests where tutorId matches the logged-in tutor and status is 'pending'
        const q = query(
          collection(firestore, 'sessions'),
          where('tutorId', '==', user.studentNum), // Assuming `studentNum` is the tutor's unique ID
          where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
          const fetchedRequests = [];

          // Iterate over each session request
          for (const doc of querySnapshot.docs) {
            const data = doc.data();
            const studentRating = await calculateStudentRating(data.studentId); // Fetch the student's rating
            fetchedRequests.push({ id: doc.id, ...data, studentRating });
          }

          setRequests(fetchedRequests);
          setLoading(false);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching session requests: ", error);
        Alert.alert("Error", "Failed to fetch session requests.");
        setLoading(false);
      }
    };

    // Helper function to calculate the average rating for a student
    const calculateStudentRating = async (studentId) => {
      const sessionsRef = collection(firestore, 'sessions');
      const q = query(sessionsRef, where('studentId', '==', studentId));

      const querySnapshot = await getDocs(q);
      let totalRating = 0;
      let ratingCount = 0;

      querySnapshot.forEach((doc) => {
        const session = doc.data();
        if (session.studentRating) {
          totalRating += session.studentRating;
          ratingCount++;
        }
      });

      return ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 'No ratings yet';
    };

    fetchRequestsAndRatings();
  }, [user]);

  const handleAccept = async (request) => {
    try {
      const requestRef = doc(firestore, 'sessions', request.id);
      await updateDoc(requestRef, { status: 'accepted' });
      Alert.alert("Success", "Session request accepted.");
      navigation.navigate('Chat', {
        request,
        tutorId: user.studentNum, // assuming this is the tutor's ID
        studentId: request.studentId // or however you get the student's ID
      });
    } catch (error) {
      console.error("Error accepting request: ", error);
      Alert.alert("Error", "Failed to accept the request.");
    }
  };

  const handleDecline = (requestId) => {
    Alert.alert(
      'Confirm Decline',
      'Are you sure you want to decline this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => declineRequest(requestId) },
      ],
      { cancelable: false }
    );
  };

  const declineRequest = async (requestId) => {
    try {
      const requestRef = doc(firestore, 'sessions', requestId);
      await updateDoc(requestRef, { status: 'declined' });
      Alert.alert("Declined", "Session request declined.");
    } catch (error) {
      console.error("Error declining request: ", error);
      Alert.alert("Error", "Failed to decline the request.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.requestContainer}>
      <Text style={styles.module}>Module: {item.module}</Text>
      <Text>Date Requested: {item.sessionDate ? new Date(item.sessionDate.toDate()).toLocaleDateString() : 'N/A'}</Text>
      <Text>Time: {item.timeSlot}</Text>
      <Text>Additional Info: {item.additionalDetails}</Text>
      <Text>Student ID: {item.studentId}</Text>

      {/* Display student's average rating */}
      <Text>Student Rating: {item.studentRating || 'No ratings yet'}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(item)}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline(item.id)}>
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
      </View>
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
      <Text style={styles.title}>Session Requests</Text>
      {requests.length === 0 ? (
        <Text style={styles.noRequestsText}>No pending session requests.</Text>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />
      )}
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
  noRequestsText: {
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
  requestContainer: {
    padding: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  module: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    flex: 0.48,
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
    flex: 0.48,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SessionRequests;
