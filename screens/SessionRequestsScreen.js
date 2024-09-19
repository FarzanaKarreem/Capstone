import { collection, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig'; // Adjust the path as needed
import { useUser } from '../screens/UserProvider'; // Adjust the path as needed

const SessionRequests = ({ navigation }) => {
  const { user } = useUser(); // Get current user from context
  const [requests, setRequests] = useState([]);
  const [studentRatings, setStudentRatings] = useState({}); // State to store student ratings
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    const fetchRequests = async () => {
      setLoading(true);
      try {
        // Fetch session requests where tutorId matches the logged-in tutor and status is 'pending'
        const q = query(
          collection(firestore, 'sessions'),
          where('tutorId', '==', user.studentNum), // Assuming `studentNum` is the tutor's unique ID
          where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const fetchedRequests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRequests(fetchedRequests);

          // Fetch average ratings for students
          fetchStudentRatings(fetchedRequests);
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching session requests: ", error);
        Alert.alert("Error", "Failed to fetch session requests.");
        setLoading(false);
      }
    };

    const fetchStudentRatings = async (requests) => {
      try {
        // Create a set of unique student IDs from the requests
        const studentIds = [...new Set(requests.map(request => request.studentId))];
        
        // Fetch all user docs that match the studentIds
        const q = query(collection(firestore, 'users'), where('studentNum', 'in', studentIds));
        const querySnapshot = await getDocs(q);

        // Create a map of studentId to averageRating
        const ratingsMap = {};
        querySnapshot.forEach(doc => {
          const data = doc.data();
          ratingsMap[data.studentNum] = data.averageRating; // Use studentNum as the key
        });

        setStudentRatings(ratingsMap);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student ratings: ", error);
        Alert.alert("Error", "Failed to fetch student ratings.");
      }
    };

    fetchRequests();
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
      <Text style={styles.detail}>Date Requested: {item.sessionDate ? new Date(item.sessionDate.toDate()).toLocaleDateString() : 'N/A'}</Text>
      <Text style={styles.detail}>Time: {item.timeSlot}</Text>
      <Text style={styles.detail}>Additional Info: {item.additionalDetails}</Text>
      <Text style={styles.detail}>Student ID: {item.studentId}</Text>
      
      {/* Display student rating with star */}
      <Text style={styles.detail}>
        Student Rating: {studentRatings[item.studentId] !== undefined ? `${studentRatings[item.studentId]} ★` : 'N/A'}
      </Text>
  
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
    backgroundColor: '#f4f4f9', // Light background color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f9', // Match background color
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
    color: '#333', // Darker text for better readability
    fontFamily: 'Avenir',
  },
  requestContainer: {
    padding: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 10,
    backgroundColor: '#fff', // White background for cards
    borderRadius: 8,
    elevation: 1, // Shadow for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 1 }, // Shadow offset
    shadowOpacity: 0.1, // Shadow opacity
    shadowRadius: 2, // Shadow radius
  },
  module: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333', // Darker text color for emphasis
    fontFamily: 'Avenir',
  },
  detail: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666', // Lighter text color for details
    fontFamily: 'Avenir',
  },
  buttonContainer: {
    flexDirection: 'column', // Arrange buttons vertically
    alignItems: 'center',
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#aaf0c9', // Lighter green color for accept
    padding: 10,
    borderRadius: 5,
    width: '100%', // Full width for button
    alignItems: 'center',
    marginBottom: 10, // Spacing between buttons
  },
  declineButton: {
    backgroundColor: '#FF7F7F', // Lighter red color for decline
    padding: 10,
    borderRadius: 5,
    width: '100%', // Full width for button
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
  },
});

export default SessionRequests;
