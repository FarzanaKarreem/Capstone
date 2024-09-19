import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig'; // Adjust the path according to your file structure
import { useUser } from '../screens/UserProvider';

const RequestScreen = ({ route, navigation }) => {
  const { tutor } = route.params;  // Receive tutor details from the previous screen
  const { user } = useUser();

  console.log('User Data:', user); // Log user data
  console.log('Student Number:', user?.studentNum); // Log student number

  const [selectedModule, setSelectedModule] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [timeSlotModalVisible, setTimeSlotModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const timeSlots = [
    '8:00 AM - 9:00 AM',
    '9:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 1:00 PM',
    '1:00 PM - 2:00 PM',
    '2:00 PM - 3:00 PM',
    '3:00 PM - 4:00 PM',
    '4:00 PM - 5:00 PM',
    '5:00 PM - 6:00 PM',
    '6:00 PM - 7:00 PM',
    '7:00 PM - 8:00 PM',
  ];

  const handleSubmit = async () => {
    if (!selectedModule || !selectedTimeSlot || !additionalDetails) {
      Alert.alert("Incomplete Details", "Please fill out all fields before submitting.");
      return;
    }

    try {
      await addDoc(collection(firestore, 'sessions'), {
        additionalDetails,
        createdAt: serverTimestamp(),
        module: selectedModule,
        status: 'pending',
        studentId: user.studentNum, // Use `studentId` field for the student
        timeSlot: selectedTimeSlot,
        tutorId: tutor.studentNum, // Use `tutorId` field for the tutor
        sessionDate: selectedDate, // Store the selected date
      });

      setConfirmationModalVisible(true);

      // Reset form fields if needed
      setSelectedModule('');
      setSelectedTimeSlot('');
      setAdditionalDetails('');
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "There was an issue submitting your request. Please try again.");
    }
  };

  const closeConfirmationModal = () => {
    setConfirmationModalVisible(false);
    navigation.navigate('Home', { user });
  };

  // Handle Date Picker Change
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Request a Session</Text>

        <TextInput
          placeholder="Type the module"
          value={selectedModule}
          onChangeText={setSelectedModule}
          style={styles.input}
        />

        {/* Date Picker */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{selectedDate ? selectedDate.toDateString() : 'Select Date'}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()} // Optional: Prevent selecting past dates
          />
        )}

        {/* Time Slot Picker */}
        <TouchableOpacity
          onPress={() => setTimeSlotModalVisible(true)}
          style={styles.input}
        >
          <Text>{selectedTimeSlot || 'Select Time Slot'}</Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Enter additional details"
          value={additionalDetails}
          onChangeText={setAdditionalDetails}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, isFocused && styles.inputFocused]}
        />

        {/* Submit Request Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Submit Request</Text>
        </TouchableOpacity>

        {/* Time Slot Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={timeSlotModalVisible}
          onRequestClose={() => setTimeSlotModalVisible(!timeSlotModalVisible)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Select Time Slot</Text>
              {timeSlots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalButton}
                  onPress={() => {
                    setSelectedTimeSlot(slot);
                    setTimeSlotModalVisible(false);
                  }}
                >
                  <Text style={styles.modalButtonText}>{slot}</Text>
                </TouchableOpacity>
              ))}
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setTimeSlotModalVisible(!timeSlotModalVisible)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Confirmation Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={confirmationModalVisible}
          onRequestClose={() => setConfirmationModalVisible(!confirmationModalVisible)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Request Sent</Text>
              <Text>Your request has been sent successfully.</Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={closeConfirmationModal}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Avenir', // Use the preferred font
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    justifyContent: 'center',
  },
  inputFocused: {
    borderColor: '#007BFF',
    borderWidth: 2,
    backgroundColor: '#f0f8ff',
  },
  submitButton: {
    backgroundColor: '#007bff', // Background color of the button
    padding: 15, // Padding inside the button
    borderRadius: 5, // Rounded corners
    alignItems: 'center', // Center the text inside the button
    marginTop: 20, // Space above the button
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow position
    shadowOpacity: 0.25, // Shadow opacity
    shadowRadius: 3.84, // Shadow blur
    elevation: 5, // Shadow for Android
  },
  submitButtonText: {
    color: '#fff', // Text color
    fontSize: 16, // Text size
    fontWeight: 'bold', // Bold text
    fontFamily: 'Avenir', // Use the preferred font
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
    fontFamily: 'Avenir', // Use the preferred font
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Avenir', // Use the preferred font
  },
  modalCloseButton: {
    backgroundColor: '#ccc',
    padding: 10,
    marginTop: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Avenir', // Use the preferred font
  },
});

export default RequestScreen;
