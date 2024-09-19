import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons
import { firestore } from '../firebase/firebaseConfig';

const SearchScreen = ({ route, navigation }) => {
  const [module, setModule] = useState('');
  const [suggestedTutors, setSuggestedTutors] = useState([]);
  const [noSuggestions, setNoSuggestions] = useState(false);
  const { user } = route.params;

  useEffect(() => {
    const fetchAverageRating = async (tutorId) => {
      try {
        const sessionsQuery = query(
          collection(firestore, 'sessions'),
          where('tutorId', '==', tutorId),
        );
        const querySnapshot = await getDocs(sessionsQuery);

        let totalRating = 0;
        let count = 0;

        querySnapshot.forEach(doc => {
          const session = doc.data();
          if (session.rating) {
            totalRating += session.rating;
            count++;
          }
        });

        return count > 0 ? (totalRating / count).toFixed(1) : 'No Rating';
      } catch (error) {
        console.error('Error fetching tutor ratings:', error);
        return 'No Rating';
      }
    };

    const fetchSuggestedTutors = async () => {
      try {
        const studentDegree = user.degree.toLowerCase().trim();
        const studentDegreeWords = studentDegree.split(' ').filter(Boolean);

        const tutorsQuery = query(
          collection(firestore, 'users'),
          where('role', '==', 'tutor')
        );

        const querySnapshot = await getDocs(tutorsQuery);
        const tutors = [];

        for (const doc of querySnapshot.docs) {
          const tutor = doc.data();
          if (tutor.degree) {
            const tutorDegree = tutor.degree.toLowerCase().trim();
            const tutorDegreeWords = tutorDegree.split(' ').filter(Boolean);

            if (studentDegree === tutorDegree || studentDegreeWords.some(word => tutorDegreeWords.includes(word))) {
              const avgRating = await fetchAverageRating(doc.id);
              tutors.push({ id: doc.id, ...tutor, avgRating });
            }
          }
        }

        if (tutors.length === 0) {
          setNoSuggestions(true);
        } else {
          setSuggestedTutors(tutors.slice(0, 3));
          setNoSuggestions(false);
        }
      } catch (error) {
        console.error('Error fetching suggested tutors:', error);
      }
    };

    fetchSuggestedTutors();
  }, [user.degree]);

  const handleSearch = () => {
    navigation.navigate('TutorList', { module: module.trim().toLowerCase(), user });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for Tutors</Text>

      {noSuggestions ? (
        <Text style={styles.noSuggestionsText}>No suggested tutors available</Text>
      ) : (
        suggestedTutors.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.subtitle}>Suggested Tutors</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestedTutors.map(tutor => (
                <TouchableOpacity
                  key={tutor.id}
                  style={styles.suggestionCard}
                  onPress={() => navigation.navigate('TutorDetail', { tutor, user })}
                >
                  <Text style={styles.cardTitle}>{tutor.name}</Text>
                  {tutor.isVerified && <Icon name="check" size={16} color="green" style={styles.verifiedIcon} />}
                  <Text style={styles.cardContent}>Degree: {tutor.degree}</Text>
                  <Text style={styles.cardContent}>Rating: {tutor.avgRating}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )
      )}

      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter Module"
          value={module}
          onChangeText={setModule}
        />
        <Button title="Search" onPress={handleSearch} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  suggestionCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardContent: {
    fontSize: 14,
    marginTop: 5,
  },
  searchSection: {
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  noSuggestionsText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  verifiedIcon: {
    marginLeft: 5,
  },
});

export default SearchScreen;
