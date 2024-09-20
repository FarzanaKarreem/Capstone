import { useNavigation, useRoute } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';

const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId } = route.params; // Get sessionId from route params

  const updateSessionStatus = async (status) => {
    try {
      const sessionRef = doc(firestore, 'sessions', sessionId);
      await updateDoc(sessionRef, { status });
    } catch (error) {
      Alert.alert("Error", "Could not update session status.");
    }
  };

  const handleCashPayment = () => {
    Alert.alert(
      'Payment Method',
      'Please collect the student\'s cash.',
      [
        { 
          text: 'OK', 
          onPress: async () => {
            await updateSessionStatus('Paid'); // Change status to Paid
            navigation.navigate('SessionStatus'); // Navigate back to session status
          }
        },
      ],
      { cancelable: false }
    );
  };

  const handleZapperPayment = () => {
    setPaymentMethod('zapper');
  };

  const handlePaid = async () => {
    await updateSessionStatus('Paid'); // Change status to Paid
    navigation.navigate('SessionStatus'); // Navigate back to session status
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment for Session</Text>
      {!paymentMethod ? (
        <View>
          <Text style={styles.subtitle}>How would the student like to pay?</Text>
          
          <TouchableOpacity onPress={handleCashPayment} style={styles.paymentOption}>
            <Image 
              source={require('../assets/money.jpg')} 
              style={styles.paymentImage}
            />
            <Text style={styles.paymentText}>Pay by Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleZapperPayment} style={styles.paymentOption}>
            <Image 
              source={require('../assets/scanme.jpg')} 
              style={styles.paymentImage}
            />
            <Text style={styles.paymentText}>Pay by Zapper</Text>
          </TouchableOpacity>
        </View>
      ) : paymentMethod === 'zapper' ? (
        <View>
          <Text style={styles.subtitle}>Tell the student to scan the QR Code to Pay</Text>
          <Image
            source={require('../assets/Zapper.png')}
            style={styles.qrCode}
          />
          <Button title="Paid" onPress={handlePaid} />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Avenir',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Avenir',
  },
  paymentOption: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
    elevation: 1,
  },
  paymentImage: {
    width: 280,
    height: 150,
    marginBottom: 10,
  },
  paymentText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Avenir',
  },
  qrCode: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default PaymentScreen;
