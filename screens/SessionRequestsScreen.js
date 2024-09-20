import { collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
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

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(firestore, 'sessions'),
          where('tutorId', '==', user.studentNum),
          where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
          const fetchedRequests = await Promise.all(
            querySnapshot.docs.map(async (doc) => {
              const sessionData = { id: doc.id, ...doc.data() };
              const averageRating = await fetchAverageRating(sessionData.studentId);
              return { ...sessionData, averageRating };
            })
          );

          setRequests(fetchedRequests);
          await deleteExpiredRequests(fetchedRequests); // Check for expired requests
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching session requests: ", error);
        Alert.alert("Error", "Failed to fetch session requests.");
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const fetchAverageRating = async (studentId) => {
    try {
      const usersQuery = query(
        collection(firestore, 'users'),
        where('studentNum', '==', studentId)
      );
      const userSnapshot = await getDocs(usersQuery);
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0].data();
        return userDoc.averageRating || null;
      }
    } catch (error) {
      console.error("Error fetching average rating: ", error);
    }
    return null;
  };

  const deleteExpiredRequests = async (requests) => {
    const now = new Date();
    for (const request of requests) {
      const sessionDate = request.sessionDate ? request.sessionDate.toDate() : null; // Ensure sessionDate is a Date object
      if (sessionDate && sessionDate < now) {
        try {
          await deleteDoc(doc(firestore, 'sessions', request.id));
          console.log(`Deleted expired request: ${request.id}`);
        } catch (error) {
          console.error("Error deleting expired request: ", error);
        }
      }
    }
  };

  const handleAccept = async (request) => {
    try {
        const requestRef = doc(firestore, 'sessions', request.id);
        await updateDoc(requestRef, { status: 'accepted' });
        Alert.alert("Success", "Session request accepted.");
        // Navigate to chat screen
        navigation.navigate('Chat', {
            request,
            tutorId: user.studentNum,
            studentId: request.studentId
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
        await deleteDoc(doc(firestore, 'sessions', requestId));
        Alert.alert("Declined", "Session request declined.");
        // No need to set state here; onSnapshot will handle UI updates
    } catch (error) {
        console.error("Error declining request: ", error);
        Alert.alert("Error", "Failed to decline the request.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.requestContainer}>
      <Text style={styles.module}>Module: {item.module}</Text>
      <Text style={styles.detail}>Date Requested: {item.sessionDate ? new Date(item.sessionDate.toDate()).toLocaleDateString() : 'N/A'}</Text>
      <Text style={styles.detail}>Time: {item.timeSlot}</Text>
      <Text style={styles.detail}>Additional Info: {item.additionalDetails}</Text>
      <Text style={styles.detail}>Student ID: {item.studentId}</Text>
      {item.averageRating !== null && (
        <Text style={styles.detail}>Average Rating: {item.averageRating.toFixed(2)}</Text>
      )}

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
    backgroundColor: '#f4f4f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f9',
  },
  noRequestsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
    fontFamily: 'Avenir',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'Avenir',
  },
  requestContainer: {
    padding: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  module: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    fontFamily: 'Avenir',
  },
  detail: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
    fontFamily: 'Avenir',
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#aaf0c9',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  declineButton: {
    backgroundColor: '#FF7F7F',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
  },
});

export default SessionRequests;
