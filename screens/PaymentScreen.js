// screens/PaymentScreen.js
import React, { useState } from 'react';
import { View, Text, Button, Image, Alert } from 'react-native';
import styles from '../styles/styles';
import { useNavigation } from '@react-navigation/native'; // Import for navigation

const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const navigation = useNavigation(); // Use navigation hook

  const handleCashPayment = () => {
    Alert.alert(
      'Payment Method',
      'Please collect the student\'s cash.',
      [
        { text: 'OK', onPress: () => navigation.navigate('SessionStatus') }, // Navigate back to SessionStatus
      ],
      { cancelable: false }
    );
  };

  const handleZapperPayment = () => {
    setPaymentMethod('zapper');
  };

  const handlePaid = () => {
    navigation.navigate('SessionStatus'); // Navigate back to SessionStatus
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment for Session</Text>
      {!paymentMethod ? (
        <View>
          <Text style={styles.subtitle}>How would the student like to pay?</Text>
          <Button title="Pay by Cash" onPress={handleCashPayment} />
          <Button title="Pay by Zapper" onPress={handleZapperPayment} />
        </View>
      ) : paymentMethod === 'zapper' ? (
        <View>
          <Text style={styles.subtitle}>Tell the student to scan the QR Code to Pay</Text>
          <Image
            source={require('../assets/Zapper.png')}// Replace with QR code URL
            style={styles.qrCode}
          />
          <Button title="Paid" onPress={handlePaid} />
        </View>
      ) : null}
    </View>
  );
};

export default PaymentScreen;
