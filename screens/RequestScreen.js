/**
 * RequestScreen 
 * 
 * This screen allows students to request a tutoring session with a selected tutor.
 * Users can specify the module, select a date, choose a time slot, and provide additional 
 * details about their request. The screen includes modals for selecting time slots and 
 * confirming the request submission.
 */ 
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import { useUser } from '../screens/UserProvider';

const RequestScreen = ({ route, navigation }) => {
  const { tutor } = route.params;
  const { user } = useUser();

  const [selectedModule, setSelectedModule] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [timeSlotModalVisible, setTimeSlotModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  //timeSlots
  const allTimeSlots = [
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

  // Automatically set the date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
  }, []);

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
        studentId: user.studentNum, 
        timeSlot: selectedTimeSlot,
        tutorId: tutor.studentNum,
        sessionDate: selectedDate,
      });

      setConfirmationModalVisible(true);

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
            minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))} // next  date is tomorrow
          />
        )}

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
              {allTimeSlots.map((slot, index) => (
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
//styles for request screen
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
    fontFamily: 'Avenir',
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
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Avenir',
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
    fontFamily: 'Avenir',
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
    fontFamily: 'Avenir',
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
    fontFamily: 'Avenir',
  },
});

export default RequestScreen;
