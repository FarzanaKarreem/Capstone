// screens/ReviewScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import styles from '../styles/styles';

const ReviewScreen = ({ navigation }) => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState('good'); // 'good' or 'bad'

  const handleReviewSubmit = () => {
    // Submit review logic here
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leave a Review</Text>
      <TextInput
        style={styles.input}
        placeholder="Write your review here"
        value={review}
        onChangeText={setReview}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={() => setRating('good')}>
          <Text style={styles.link}>👍 Good</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRating('bad')}>
          <Text style={styles.link}>👎 Bad</Text>
        </TouchableOpacity>
      </View>
      <Button title="Submit Review" onPress={handleReviewSubmit} />
    </View>
  );
};

export default ReviewScreen;