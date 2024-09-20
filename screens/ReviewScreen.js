/**
 * ReviewScreen - rating stars used instead
 * 
 * This allows users to leave a review and rate their experience 
 * with a tutor. Users can input a textual review and select a rating of 
 * either 'good' or 'bad' using emoji buttons. Upon submission, the review 
 * will be processed, and the user will be navigated back to the Home screen.
 */
import React, { useState } from 'react';
import { Button, Text, TextInput, TouchableOpacity, View } from 'react-native';
import styles from '../styles/styles';

const ReviewScreen = ({ navigation }) => {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState('good'); // 'good' or 'bad'

  const handleReviewSubmit = () => {
    //testing
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