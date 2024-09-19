import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons
import { firestore } from '../firebase/firebaseConfig';
import styles from '../styles/styles';

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

        const tutorsWithRatings = await Promise.all(fetchedTutors.map(async (tutor) => {
          const averageRating = await calculateAverageRating(tutor.id);
          return { ...tutor, averageRating };
        }));

        setTutors(tutorsWithRatings);
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
                
                {/* Display verification status with icons */}
                <View style={styles.verificationContainer}>
                  <Text style={styles.cardContent}>Verified: </Text>
                  {tutor.isVerified ? (
                    <Icon name="check" size={16} color="green" />
                  ) : (
                    <Icon name="times" size={16} color="red" />
                  )}
                </View>

                {/* Display average rating */}
                <Text style={styles.cardContent}>
                  Average Rating: {tutor.averageRating} ★
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

export default TutorListScreen;

// Function to calculate average tutor rating, reusable in both screens
const calculateAverageRating = async (tutorId) => {
  const sessionsRef = collection(firestore, 'sessions');
  const q = query(sessionsRef, where('tutorId', '==', tutorId));
  const querySnapshot = await getDocs(q);
  
  let totalRating = 0;
  let ratingCount = 0;

  querySnapshot.forEach(doc => {
    const session = doc.data();
    if (session.tutorRating) {
      totalRating += session.tutorRating;
      ratingCount++;
    }
  });

  return ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 'No ratings yet';
};
