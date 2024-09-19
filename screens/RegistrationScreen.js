import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const RegistrationScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register as</Text>
      <Button
        title="Student"
        onPress={() => navigation.navigate('StudentRegistration')}
      />
      <Button
        title="Tutor"
        onPress={() => navigation.navigate('TutorRegistration')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default RegistrationScreen;
