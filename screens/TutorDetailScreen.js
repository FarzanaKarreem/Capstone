import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons
import { firestore } from '../firebase/firebaseConfig';
import styles from '../styles/styles';

const TutorDetailScreen = ({ route, navigation }) => {
  const { tutor } = route.params;
  const [averageRating, setAverageRating] = useState('No Rating');

  useEffect(() => {
    const fetchAverageRating = async () => {
      const rating = await calculateAverageRating(tutor.id);
      setAverageRating(rating);
    };

    fetchAverageRating();
  }, [tutor.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tutor Details</Text>
      <ScrollView>
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
        
        <Text style={styles.cardContent}>Rating: {averageRating} ★</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Request', { tutor })}
        >
          <Text style={styles.link}>Book Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default TutorDetailScreen;

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
