import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import FontAwesome icons

const TutorDetailScreen = ({ route, navigation }) => {
  const { tutor } = route.params;
  const [averageRating, setAverageRating] = useState('No Rating');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tutor Details</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{tutor.name}</Text>
          <Text style={styles.cardContent}>Degree: {tutor.degree}</Text>
          <Text style={styles.cardContent}>Bio: {tutor.bio}</Text>
          <Text style={styles.cardContent}>Availability: {tutor.availability}</Text>
          <Text style={styles.cardContent}>
            Average Rating: {tutor.averageRating ? `${tutor.averageRating} ★` : 'No ratings yet'}
          </Text>

          {/* Display verification status with icons */}
          <View style={styles.verificationContainer}>
            <Text style={styles.cardContent}>Verified: </Text>
            {tutor.isVerified ? (
              <Icon name="check" size={16} color="green" style={styles.icon} />
            ) : (
              <Icon name="times" size={16} color="red" style={styles.icon} />
            )}
          </View>

          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('Request', { tutor })}
          >
            <Text style={styles.bookButtonText}>Book Session</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f9',
    padding: 10,
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Avenir',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
    fontFamily: 'Avenir',
  },
  cardContent: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    fontFamily: 'Avenir',
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  icon: {
    marginLeft: 5,
  },
  bookButton: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Avenir',
  },
  link: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Avenir',
  },
});

export default TutorDetailScreen;