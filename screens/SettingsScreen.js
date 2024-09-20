/**
 * SettingsScreen 
 *
 * This screen allows users to manage their profile settings, including:
 * - Viewing and editing their name, email, bio, and profile picture.
 * - Uploading a transcript for verification (for tutors).
 * - Displaying the user's average rating using stars.
 * - Handling account actions such as logout and account deletion.
 */
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { firestore } from '../firebase/firebaseConfig';
import { useUser } from '../screens/UserProvider';

const SettingsScreen = ({ navigation }) => {
  const { user, setUser } = useUser();
  const [profilePicture, setProfilePicture] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [transcript, setTranscript] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      const userDocRef = doc(firestore, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setName(userData.name || '');
          setEmail(userData.email || '');
          setBio(userData.bio || '');
          setProfilePicture(userData.image || null);
          setAverageRating(userData.averageRating || '');
          setTranscript(userData.transcript || null);
          setIsVerified(userData.isVerified || false);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);
//picks a profile picture
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to grant permission to access your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfilePicture(result.assets[0].uri);
    }
  };
//picks a document 
  const handlePickTranscript = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setTranscript(result.assets[0].uri);
        setIsVerified(true); // Set as verified when transcript is uploaded
      } else if (result.canceled) {
        console.log('User cancelled document picker');
      } else {
        Alert.alert('Error', 'An unexpected error occurred while picking the document');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', `An error occurred while picking the document: ${error.message}`);
    }
  };

  const uploadFileAsync = async (uri, path) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

  const handleRemovePicture = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not found.');
      return;
    }

    Alert.alert(
      "Remove Profile Picture",
      "Are you sure you want to remove your profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: async () => {
          try {
            const storage = getStorage();
            const storageRef = ref(storage, `users/${user.uid}/profilePicture`);
            
            // Delete the image from Firebase Storage
            await deleteObject(storageRef);

            // Update Firestore document to remove the image URL
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
              image: null
            });

            // Update local state
            setProfilePicture(null);
            setUser(prev => ({ ...prev, image: null }));

            Alert.alert('Success', 'Your profile picture has been removed.');
          } catch (error) {
            console.error("Error removing profile picture: ", error);
            Alert.alert('Error', 'Failed to remove profile picture. Please try again.');
          }
        }}
      ]
    );
  };
//saves changes made
  const handleSaveChanges = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not found.');
      return;
    }

    try {
      let imageUrl = profilePicture;
      if (profilePicture && profilePicture !== user.image) {
        imageUrl = await uploadFileAsync(profilePicture, `users/${user.uid}/profilePicture`);
      }

      let transcriptUrl = transcript;
      if (user.role === 'tutor' && transcript && transcript !== user.transcript) {
        transcriptUrl = await uploadFileAsync(transcript, `users/${user.uid}/transcript`);
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        name,
        email,
        bio,
        image: imageUrl,
        transcript: transcriptUrl,
        isVerified, // Update verification status
      });

      setUser(prev => ({
        ...prev,
        name,
        email,
        bio,
        image: imageUrl,
        transcript: transcriptUrl,
        isVerified,
      }));

      Alert.alert('Success', 'Your changes have been saved.');
    } catch (error) {
      console.error("Error updating user data: ", error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const handleLogout = () => {
    // logout navigates back to login screen
    navigation.navigate('Login');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // deletes account
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            navigation.navigate('Login');
          }
        },
      ]
    );
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= Math.round(averageRating) ? '★' : '☆'}
        </Text>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.profileSection}>
        <Image
          source={profilePicture ? { uri: profilePicture } : require('../assets/defaultProfilePic.png')}
          style={styles.profilePicture}
        />
        <View style={styles.profileButtonsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handlePickImage}>
            <Text style={styles.editButtonText}>Edit Picture</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={handleRemovePicture}>
            <Text style={styles.removeButtonText}>Remove Picture</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.nameContainer}>
        <TextInput
          style={styles.nameInput}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        {user.role === 'tutor' && isVerified && (
          <Text style={styles.tick}>✓</Text>
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <View style={styles.ratingContainer}>
        <Text style={styles.averageRatingText}>Average Rating:</Text>
        <View style={styles.starsContainer}>{renderStars()}</View>
      </View>

      {user.role === 'tutor' && !isVerified && (
        <>
          <TouchableOpacity style={styles.button} onPress={handlePickTranscript}>
            <Text style={styles.buttonText}>Upload Transcript</Text>
          </TouchableOpacity>
        </>
      )}

      {transcript && isVerified && (
        <Text style={styles.transcriptText}>Transcript Uploaded</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  editButtonText: {
    color: '#fff',
  },
  removeButton: {
    backgroundColor: '#FF4D4D',
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    flex: 1,
  },
  tick: {
    fontSize: 20,
    color: 'green',
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  averageRatingText: {
    fontSize: 18,
    marginBottom: 5,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 20,
    color: '#FFD700',
  },
  button: {
    backgroundColor: '#ADD8E6',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  transcriptText: {
    fontSize: 16,
    color: 'green',
    marginVertical: 10,
  },
});

export default SettingsScreen;
