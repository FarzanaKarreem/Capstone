import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// app Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzs-yS2vnv7Ibhoh1k9OAyOV7yRD7ssUA",
  authDomain: "tutor-5039e.firebaseapp.com",
  projectId: "tutor-5039e",
  storageBucket: "tutor-5039e.appspot.com",
  messagingSenderId: "530891669348",
  appId: "1:530891669348:android:29781ec379ee8385218471",
  //measurementId:
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


let auth;
if (!auth) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

const firestore = getFirestore(app);
export { auth, firestore };

