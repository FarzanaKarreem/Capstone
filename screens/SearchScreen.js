/**
 * SearchScreen Component
 * 
 * This screen  allows users to search for tutors based on their degree 
 * and view suggested tutors who match using a matching algorithm based on the degree. 
 * Users can input a module and receive a list of tutors 
 * with their ratings, helping them find a suitable match
 */ 
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { firestore } from '../firebase/firebaseConfig';

const SearchScreen = ({ route, navigation }) => {
  const [module, setModule] = useState('');
  const [suggestedTutors, setSuggestedTutors] = useState([]);
  const [noSuggestions, setNoSuggestions] = useState(false);
  const { user } = route.params;

  useEffect(() => {
    const fetchTutorRating = async (tutorId) => {
      try {
        const tutorDoc = await getDoc(doc(firestore, 'users', tutorId));
        if (tutorDoc.exists()) {
          const tutorData = tutorDoc.data();
          return tutorData.averageRating || 'No Rating'; //displays the rating of the tutor 
        }
        return 'No Rating';
      } catch (error) {
        console.error('Error fetching tutor rating:', error);
        return 'No Rating';
      }
    };

    //Retrives the top 3 suggested tutors for this specific user depending on their degree
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
              const averageRating = await fetchTutorRating(doc.id);
              tutors.push({ id: doc.id, ...tutor, averageRating });
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
      <Text style={styles.title}>Find Your Perfect Tutor</Text>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.input}
          placeholder="Enter Module"
          placeholderTextColor="#A0AEC0"
          value={module}
          onChangeText={setModule}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

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
                  {tutor.isVerified && <Icon name="check-circle" size={16} color="#48BB78" style={styles.verifiedIcon} />}
                  <Text style={styles.cardContent}>Degree: {tutor.degree}</Text>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={16} color="#F6E05E" />
                    <Text style={styles.ratingText}>{tutor.averageRating}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )
      )}

      <Image
        source={{ uri: '/api/placeholder/400/200' }}
        style={styles.bottomImage}
      />
    </View>
  );
};
//styles for search screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F7FAFC',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2D3748',
    fontFamily: 'Avenir',
  },
  searchSection: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
    color: '#4A5568',
  },
  searchButton: {
    backgroundColor: '#4299E1',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2D3748',
    fontFamily: 'Avenir',
  },
  suggestionCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2D3748',
    fontFamily: 'Avenir',
  },
  cardContent: {
    fontSize: 14,
    marginTop: 5,
    color: '#4A5568',
    fontFamily: 'Avenir',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#4A5568',
    fontFamily: 'Avenir',
  },
  noSuggestionsText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    color: '#718096',
    fontFamily: 'Avenir',
  },
  verifiedIcon: {
    marginLeft: 5,
  },
  bottomImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 20,
  },
});

export default SearchScreen;