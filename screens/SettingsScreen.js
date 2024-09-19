import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
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
          setAverageRating(userData.averageRating || 0);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

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

  const uploadImageAsync = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storage = getStorage();
    const storageRef = ref(storage, `users/${user.uid}/profilePicture`);
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

  const handleSaveChanges = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not found.');
      return;
    }

    try {
      let imageUrl = profilePicture;
      if (profilePicture && profilePicture !== user.image) {
        imageUrl = await uploadImageAsync(profilePicture);
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        name,
        email,
        bio,
        image: imageUrl,
      });

      setUser(prev => ({
        ...prev,
        name,
        email,
        bio,
        image: imageUrl,
      }));

      Alert.alert('Success', 'Your changes have been saved.');
    } catch (error) {
      console.error("Error updating user data: ", error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const handleLogout = () => {
    // Implement logout logic here
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
            // Implement account deletion logic here
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

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
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

      <TouchableOpacity style={styles.button} onPress={handleSaveChanges}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  profileButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  averageRatingText: {
    fontSize: 16,
    marginRight: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 20,
    color: '#f1c40f',
  },
});

export default SettingsScreen;