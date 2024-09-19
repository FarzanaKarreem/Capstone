import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Added StyleSheet here
import Icon from 'react-native-vector-icons/FontAwesome';
import { firestore } from '../firebase/firebaseConfig';

const TutorListScreen = ({ route, navigation }) => {
  const { module } = route.params;
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      try {
        const tutorsRef = collection(firestore, 'users');
        const q = query(tutorsRef, where('role', '==', 'tutor'));
        const querySnapshot = await getDocs(q);

        const fetchedTutors = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.degree.toLowerCase().replace(/\s+/g, '').includes(module.replace(/\s+/g, ''))) {
            fetchedTutors.push({ id: doc.id, ...data });
          }
        });

        // Sort tutors by average rating in descending order
        const sortedTutors = fetchedTutors.sort((a, b) => {
          const aRating = a.averageRating || 0;
          const bRating = b.averageRating || 0;
          return bRating - aRating; // Sort from highest to lowest
        });

        setTutors(sortedTutors);
      } catch (error) {
        console.error("Error fetching tutors: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, [module]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tutors for {module}</Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        tutors.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No tutors found for "{module}".</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>Back to Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView>
            {tutors.map(tutor => (
              <View key={tutor.id} style={styles.card}>
                <Text style={styles.cardTitle}>{tutor.name}</Text>
                <Text style={styles.cardContent}>Degree: {tutor.degree}</Text>
                <Text style={styles.cardContent}>Bio: {tutor.bio}</Text>
                <Text style={styles.cardContent}>Availability: {tutor.availability}</Text>
                
                <View style={styles.verificationContainer}>
                  <Text style={styles.cardContent}>Verified: </Text>
                  {tutor.isVerified ? (
                    <Icon name="check" size={16} color="green" />
                  ) : (
                    <Icon name="times" size={16} color="red" />
                  )}
                </View>

                <Text style={styles.cardContent}>
                  Average Rating: {tutor.averageRating ? `${tutor.averageRating} ★` : 'No ratings yet'}
                </Text>

                <TouchableOpacity onPress={() => navigation.navigate('TutorDetail', { tutor })}>
                  <Text style={styles.link}>See More</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )
      )}
    </View>
  );
};

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa', // Light background color
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#343a40',
    marginBottom: 20,
    fontFamily: 'Avenir',
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  noResultsText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 10,
    fontFamily: 'Avenir',
  },
  link: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Avenir',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ced4da',
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2, // Android shadow
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 5,
    fontFamily: 'Avenir',
  },
  cardContent: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 5,
    fontFamily: 'Avenir',
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
});

export default TutorListScreen;
